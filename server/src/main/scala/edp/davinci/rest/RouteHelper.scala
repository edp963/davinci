/*-
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */


package edp.davinci.rest

import java.io.File
import java.sql.{Connection, ResultSet, SQLException, Statement}
import java.util.concurrent.TimeUnit

import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ContentType.NonBinary
import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.model.headers.ContentDispositionTypes.{attachment, inline}
import akka.http.scaladsl.model.{HttpEntity, _}
import akka.http.scaladsl.server.{Directives, Route, StandardRoute}
import akka.stream.ActorMaterializer
import akka.util.{ByteString, Timeout}
import edp.davinci.util.DavinciConstants._
import edp.davinci.persistence.entities.SourceConfig
import edp.davinci.rest.view.ViewService
import edp.davinci.util.CommonUtils._
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.JsonUtils.json2caseClass
import edp.davinci.util.ResponseUtils.getHeader
import edp.davinci.util.STRenderUtils.getHTML
import edp.davinci.util.SqlUtils._
import edp.davinci.util.redis.JedisConnection
import edp.davinci.util._
import edp.davinci.{KV, ModuleInstance}
import org.slf4j.LoggerFactory

import scala.collection.mutable
import scala.collection.mutable.ListBuffer
import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import scala.util.{Failure, Success}

case class ActorMessage(sqlBuffer: mutable.Buffer[String], sourceConfig: SourceConfig, expired: Int)

object RouteHelper extends Directives {
  private val logger = LoggerFactory.getLogger(this.getClass)
  val dir: String = System.getenv("DAVINCI_HOME")
  val modules = ModuleInstance.getModule
  private lazy val fetchSize = 100
  private lazy val cacheIsEnable = ModuleInstance.getModule.config.getBoolean("cache.isEnable")
  private lazy val timeoutStr = ModuleInstance.getModule.config.getString("akka.http.server.request-timeout ")
  private lazy val requestTimeout = timeoutStr.substring(0, timeoutStr.lastIndexOf("s")).trim.toLong

  implicit lazy val system = modules.system
  implicit lazy val materializer = ActorMaterializer()
  implicit lazy val ec = modules.system.dispatcher

  def getResultComplete(session: SessionClass, viewId: Long, paginate: Paginate, cacheClass: CacheClass, contentType: NonBinary, manualInfo: ManualInfo): StandardRoute = {
    val source = Await.result(ViewService.getSource(viewId, session), new FiniteDuration(requestTimeout, SECONDS))
    if (source.nonEmpty) {
      try {
        val (sqlTemp, tableName, config, _) = source.head
        val group = source.map(_._4.getOrElse(Some("")).get).filter(_.trim != "")
        val groupVars = group.flatMap(g => json2caseClass[Seq[KV]](g))
        if (sqlTemp.trim != "") {
          logger.info("the sqlTemp written by admin:" + sqlTemp)
          val filteredSql = filterAnnotation(sqlTemp.trim)
          val queryParams = if (null != manualInfo) manualInfo.params.orNull else null
          val renderedSql: mutable.Buffer[String] = mergeAndRender(filteredSql, queryParams, groupVars)
          val sourceConfig = JsonUtils.json2caseClass[SourceConfig](config)
          val projectSql = getProjectSql(renderedSql.last, tableName, sourceConfig, paginate, manualInfo)
          logger.info("the projectSql get from sql template:" + projectSql)
          val resultSeq = executeDirect(renderedSql, projectSql, sourceConfig, cacheClass)
          contentTypeMatch(resultSeq, contentType)
        }
        else complete(BadRequest, ResponseJson[String](getHeader(400, "flatTable sql template is empty", null), "flatTable sql template is empty"))
      }
      catch {
        case sqlEx: SQLException =>
          logger.error("SQLException", sqlEx)
          complete(BadRequest, ResponseJson[String](getHeader(400, sqlEx.getMessage, null), "sql语法错误"))
        case ex: Throwable =>
          logger.error("error in get result complete ", ex)
          complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), "获取sql结果集异常"))
      }
    } else {
      logger.error("get source failure,source info size:" + source.size)
      complete(BadRequest, ResponseJson[String](getHeader(400, "no source found", null), ""))
    }
  }


  def doUpdate(session: SessionClass, viewId: Long, manualInfo: ManualInfo): StandardRoute = {
    val source = Await.result(ViewService.getUpdateSource(viewId, session), new FiniteDuration(requestTimeout, SECONDS))
    if (source.nonEmpty) {
      try {
        val (updateSql, _, config, _) = source.head
        val group = source.map(_._4.getOrElse(Some("")).get).filter(_.trim != "")
        val groupVars = group.flatMap(g => json2caseClass[Seq[KV]](g))
        val updateSql_get = updateSql.getOrElse("").trim
        if (updateSql_get != "") {
          logger.info("the sqlTemp written by admin:" + updateSql_get)
          val filteredSql = filterAnnotation(updateSql_get)
          val queryParams = if (null != manualInfo) manualInfo.params.orNull else null
          val renderedSql: mutable.Buffer[String] = mergeAndRender(filteredSql, queryParams, groupVars)
          val sourceConfig = JsonUtils.json2caseClass[SourceConfig](config)
          executeUpdate(sourceConfig, renderedSql)
          complete(OK, ResponseJson[String](getHeader(200, "do update successfully", null), "do update successfully"))
        }
        else complete(BadRequest, ResponseJson[String](getHeader(400, "flatTable sql template is empty", null), "flatTable sql template is empty"))
      }
      catch {
        case sqlException: SQLException =>
          logger.error("SQLException", sqlException)
          complete(BadRequest, ResponseJson[String](getHeader(400, sqlException.getMessage, null), "sql语法错误"))
        case exception: Throwable =>
          logger.error("error in do update ", exception)
          complete(BadRequest, ResponseJson[String](getHeader(400, exception.getMessage, null), "update操作失败"))
      }
    } else {
      logger.error("get source failure,source info size:" + source.size)
      complete(BadRequest, ResponseJson[String](getHeader(400, "no source found", null), "no source found"))
    }
  }


  def contentTypeMatch(resultList: Seq[String], contentType: NonBinary): StandardRoute = {
    val contentDisposition = if (contentType == textHtml) headers.`Content-Disposition`(inline, Map("filename" -> s"share.html")).asInstanceOf[HttpHeader]
    else headers.`Content-Disposition`(attachment, Map("filename" -> s"share.CSV")).asInstanceOf[HttpHeader]
    val route = contentType match {
      case `textHtml` =>
        complete(HttpResponse(headers = List(contentDisposition), entity = HttpEntity(textHtml, getHTML(resultList))))
      case `textCSV` =>
        val fileName = save2File(resultList)
        complete(OK, ResponseJson[String](getHeader(200, null), s"downloads/$fileName"))
      case `appJson` =>
        complete(OK, ResponseJson[ViewResult](getHeader(200, null), ViewResult(resultList, -1)))
      case _ => logger.info(s"not supported content type $contentType")
        complete(OK, ResponseJson[String](getHeader(200, null), ""))
    }
    route
  }


  def save2File(result: Seq[String]): String = {
    val fileName = java.util.UUID.randomUUID().toString + "_widget.csv"
    val file = new File(s"$dir/${DavinciConstants.downloadDir}/$fileName")
    val csvResult = result.mkString
    printToFile(file) { p => p.write(csvResult) }
    file.getName
  }

  def callAPI: Route = {

    val httpResponse = Http().singleRequest(HttpRequest(uri = "http://akka.io"))
    onComplete(httpResponse) {
      case Success(response) => response match {
        case HttpResponse(StatusCodes.OK, _, entity, _) =>
          //          val resultStr = entity.dataBytes.runFold(ByteString(""))(_ ++ _).map(_.utf8String)

          complete(OK, ResponseJson[String](getHeader(200, null), "get from quest successful"))
        case resp@HttpResponse(code, _, _, _) =>
          logger.info("Request failed, response code: " + code)
          resp.discardEntityBytes()
          complete(code, ResponseJson[String](getHeader(code.intValue(), null), "get from quest successful"))
      }
      case Failure(ex) => logger.error("call api exception", ex)
        complete(BadRequest, ResponseJson[String](getHeader(400, "", null), "api response failure"))
    }
  }


  def executeDirect(renderedSql: mutable.Buffer[String], projectSql: String, sourceConfig: SourceConfig, cacheClass: CacheClass): Seq[String] = {
    renderedSql.remove(renderedSql.length - 1)
    renderedSql.append(projectSql)
    val resultSeq: Seq[String] = if (cacheIsEnable) {
      if (cacheClass.useCache) queryCache(ActorMessage(renderedSql, sourceConfig, cacheClass.expired))
      else {
        if (cacheClass.expired > 0) {
          //update cache
          logger.info(s"cache expired time >0,expired:${cacheClass.expired}")
          val res = executeQuery(sourceConfig, renderedSql)
          JedisConnection.set(renderedSql.mkString(";"), res.toList, cacheClass.expired)
          logger.info(s"update cache (:)(:)(:)(:)(:)(:)(:)")
          res
        } else executeQuery(sourceConfig, renderedSql)
      }
    } else executeQuery(sourceConfig, renderedSql)
    resultSeq
  }


  def queryCache(actorMessage: ActorMessage): Seq[String] = {
    import akka.pattern.ask
    import scala.collection.JavaConversions._
    implicit val timeout: Timeout = Timeout(requestTimeout, TimeUnit.SECONDS)
    try {
      val resFromJedis = JedisConnection.getList(actorMessage.sqlBuffer.mkString(";"))
      if (resFromJedis.size != 0) {
        logger.info("query from redis(:)(:)(:)(:)(:)")
        resFromJedis
      }
      else {
        logger.info("query from redis size =0 ,then send to actor")
        val f = (ActorSys.getActor ? actorMessage).mapTo[Future[Seq[String]]]
        val resFuture: Future[Seq[String]] = for (o <- f; i <- o) yield i
        Await.result(resFuture, new FiniteDuration(requestTimeout, SECONDS))
      }
    } catch {
      case e: Throwable =>
        logger.error("query cache exception", e)
        throw e
    }
  }


  def mergeAndRender(sqlString: String,
                     paramSeq: Seq[KV] = null,
                     groupParams: Seq[KV] = null): mutable.Buffer[String] = {
    val sqlArray = if (sqlString.lastIndexOf(sqlSeparator) == sqlString.length - 1) sqlString.dropRight(1).split(sqlSeparator)
    else sqlString.split(sqlSeparator)
    val groupKVMap = getGroupKVMap(sqlArray, groupParams)
    val queryKVMap = getQueryKVMap(sqlArray, paramSeq)
    val noVarSql = sqlString.substring(sqlString.indexOf(STStartChar) + 1, sqlString.indexOf(STEndChar)).trim
    logger.info("sql without var defined: " + noVarSql)
    val mergeSql =
      if (groupKVMap.nonEmpty) RegexMatcher.matchAndReplace(noVarSql, groupKVMap)
      else noVarSql
    logger.info("sql after group merge: " + mergeSql)
    val renderedSql = STRenderUtils.renderSql(mergeSql, queryKVMap)
    logger.info("sql after query var render: " + renderedSql)
    val trimRenderSql = renderedSql.trim
    val resetSql =
      if (trimRenderSql.lastIndexOf(sqlSeparator) == trimRenderSql.length - 1)
        trimRenderSql.dropRight(1).split(sqlSeparator) else trimRenderSql.split(sqlSeparator)
    resetSql.toBuffer
  }


  def getGroupKVMap(sqlArr: Array[String], groupParams: Seq[KV]): mutable.HashMap[String, List[String]] = {
    val defaultParams = sqlArr.filter(_.contains(groupVar))
    val groupKVMap = mutable.HashMap.empty[String, List[String]]
    try {
      if (null != groupParams && groupParams.nonEmpty)
        groupParams.foreach(group => {
          val (k, v) = (group.k, group.v)
          if (groupKVMap.contains(k))
            groupKVMap(k) = groupKVMap(k) ::: List(v)
          else groupKVMap(k) = List(v)
        })
      if (defaultParams.nonEmpty)
        defaultParams.foreach(g => {
          val k = g.substring(g.indexOf(dollarDelimiter) + 1, g.lastIndexOf(dollarDelimiter)).trim
          val v = g.substring(g.indexOf(assignmentChar) + 1).trim
          if (!groupKVMap.contains(k))
            groupKVMap(k) = List(v)
        })
    } catch {
      case e: Throwable => logger.error("group var is not in right format!!!", e)
    }
    groupKVMap
  }

  def getQueryKVMap(sqlArr: Array[String], paramSeq: Seq[KV]): mutable.HashMap[String, String] = {
    val defaultParams = sqlArr.filter(s => s.contains(queryVar) || s.contains(updateVar))
    val queryKVMap = mutable.HashMap.empty[String, String]
    try {
      if (null != paramSeq && paramSeq.nonEmpty) paramSeq.foreach(param => queryKVMap(param.k) = param.v)
      if (defaultParams.nonEmpty)
        defaultParams.foreach(g => {
          val k = g.substring(g.indexOf(dollarDelimiter) + 1, g.lastIndexOf(dollarDelimiter)).trim
          if (g.indexOf(assignmentChar) >= 0) {
            val v = g.substring(g.indexOf(assignmentChar) + 1).trim
            if (!queryKVMap.contains(k))
              queryKVMap(k) = v
          }
        })
    } catch {
      case e: Throwable => logger.error("query var is not in right format!!!", e)
    }
    queryKVMap
  }

  def executeQuery(sourceConfig: SourceConfig, sqlBuffer: mutable.Buffer[String]): Seq[String] = {
    logger.info("the sql in getResult:")
    sqlBuffer.foreach(logger.info)
    var dbConnection: Connection = null
    var statement: Statement = null
    try {
      dbConnection = SqlUtils.getConnection(sourceConfig.url, sourceConfig.user, sourceConfig.password, 10)
      statement = dbConnection.createStatement()
      if (sqlBuffer.length > 1) for (elem <- sqlBuffer.dropRight(1)) statement.execute(elem)
      //es statement NullPointerException ,so change 2 prepareStatement
      val resultSet = dbConnection.prepareStatement(sqlBuffer.last).executeQuery()
      covert2ListBuf(resultSet, sourceConfig)
    } catch {
      case e: Throwable => logger.error("get result exception", e)
        throw e
    } finally {
      if (dbConnection != null) dbConnection.close()
    }
  }


  def executeUpdate(sourceConfig: SourceConfig, sqlBuffer: mutable.Buffer[String]): Unit = {
    logger.info("the sql in execute update:")
    sqlBuffer.foreach(logger.info)
    var dbConnection: Connection = null
    var statement: Statement = null
    try {
      dbConnection = SqlUtils.getConnection(sourceConfig.url, sourceConfig.user, sourceConfig.password, 10)
      statement = dbConnection.createStatement()
      for (elem <- sqlBuffer) statement.execute(elem)
    } catch {
      case e: Throwable => logger.error("get result exception", e)
        throw e
    } finally {
      if (dbConnection != null) dbConnection.close()
    }
  }

  def covert2ListBuf(rs: ResultSet, sourceConfig: SourceConfig): Seq[String] = {
    val resultList = new ListBuffer[Seq[String]]
    val columnList = new ListBuffer[String]
    val columnTypeList = new ListBuffer[String]
    val meta = rs.getMetaData
    for (i <- 1 to meta.getColumnCount) {
      columnList.append(meta.getColumnLabel(i))
      columnTypeList.append(meta.getColumnTypeName(i))
    }
    resultList.append(columnList)
    resultList.append(columnTypeList)
    while (rs.next()) resultList.append(getRow(rs, sourceConfig))
    resultList.map(covert2CSV)
  }

  /**
    *
    * @param querySql a SQL string; eg. SELECT * FROM Table
    * @return SQL string mixing AdHoc SQL and a count(1) sql
    */

  def getProjectSql(querySql: String, tableName: String, sourceConfig: SourceConfig, pageInfo: Paginate = null, manualInfo: ManualInfo = null): String = {
    logger.info("the initial project sql: " + querySql)
    val (filters, adHocSql) = if (null != manualInfo) (manualInfo.manualFilters.orNull, manualInfo.adHoc.orNull) else (null, null)
    val projectSqlWithFilter = if (null != filters && filters != "") s"SELECT * FROM ($querySql) AS PROFILTER WHERE $filters" else querySql
    val mixinSql = if (null != adHocSql && adHocSql.trim != "{}" && adHocSql.trim != "") {
      try {
        val sqlArr = adHocSql.toLowerCase.split(flatTable)
        if (sqlArr.size == 2) sqlArr(0) + s" ($projectSqlWithFilter) as `$tableName` ${sqlArr(1)}"
        else sqlArr(0) + s" ($projectSqlWithFilter) as `$tableName`"
      } catch {
        case e: Throwable => logger.error("adHoc sql is not in right format", e)
          throw e
      }
    } else {
      logger.info("adHoc sql is empty")
      projectSqlWithFilter
    }
    val paginateStr = CommonUtils.getPageInfo(pageInfo)
    if (paginateStr != "" && sourceConfig.url.indexOf("elasticsearch") == -1)
      s"SELECT * FROM ($mixinSql) AS PAGINATE $paginateStr"
    else mixinSql
  }


}

