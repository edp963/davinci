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

case class RequestInfo(sqlBuffer: mutable.Buffer[String], sourceConfig: SourceConfig, expired: Int)

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

  def getResultComplete(sourceFuture: Future[Seq[(String, String, String, Option[Option[String]])]],
                        contentType: NonBinary,
                        manualInfo: ManualInfo,
                        pageInfo: PageInfo,
                        cacheInfo: CacheInfo): Route = {
    onComplete(sourceFuture) {
      case Success(sourceInfo) =>
        if (sourceInfo.nonEmpty) {
          try {
            val (sqlTemp, tableName, config, _) = sourceInfo.head
            val group = sourceInfo.map(_._4.getOrElse(Some("")).get).filter(_.trim != "")
            val groupVars = group.flatMap(g => json2caseClass[Seq[KV]](g))
            if (sqlTemp.trim != "") {
              val trimSql = sqlTemp.trim
              logger.info("the sqlTemp written by admin:\n" + trimSql)
              val filterSql = filterSQl(trimSql)
              val params = if (null != manualInfo) manualInfo.params.orNull else null
              val resetSqlBuffer: mutable.Buffer[String] = mergeAndRender(filterSql, params, groupVars)
              val sourceConfig = JsonUtils.json2caseClass[SourceConfig](config)
              val projectSql = getProjectSql(resetSqlBuffer.last, tableName, sourceConfig, pageInfo, manualInfo)
              logger.info("the projectSql get from sql template:\n" + projectSql)
              val resultList = executeDirect(resetSqlBuffer, projectSql, sourceConfig, pageInfo, cacheInfo)
              contentTypeMatch(resultList, contentType)
            }
            else complete(BadRequest, ResponseJson[String](getHeader(400, "flatTable sql template is empty", null), ""))
          }
          catch {
            case sqlEx: SQLException =>
              logger.error("SQLException", sqlEx)
              complete(BadRequest, ResponseJson[String](getHeader(400, sqlEx.getMessage, null), "sql synx exception"))
            case ex: Throwable =>
              logger.error("error in get result complete ", ex)
              complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
          }
        } else complete(BadRequest, ResponseJson[String](getHeader(400, "", null), "source info is empty"))
      case Failure(ex) =>
        logger.error("get source failure ", ex)
        complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
    }
  }


  def contentTypeMatch(resultList: (Seq[String], Long), contentType: NonBinary): StandardRoute = {
    val contentDisposition = if (contentType == textHtml) headers.`Content-Disposition`(inline, Map("filename" -> s"share.html")).asInstanceOf[HttpHeader]
    else headers.`Content-Disposition`(attachment, Map("filename" -> s"share.CSV")).asInstanceOf[HttpHeader]
    val route = contentType match {
      case `textHtml` =>
        complete(HttpResponse(headers = List(contentDisposition), entity = HttpEntity(textHtml, getHTML(resultList._1))))
      case `textCSV` =>
        val fileName = save2File(resultList._1)
        complete(OK, ResponseJson[String](getHeader(200, null), s"downloads/$fileName"))
      case `appJson` =>
        complete(OK, ResponseJson[ViewResult](getHeader(200, null), ViewResult(resultList._1, resultList._2)))
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

  def callAPI = {

    val httpResponse = Http().singleRequest(HttpRequest(uri = "http://akka.io"))
    onComplete(httpResponse) {
      case Success(response) => response match {
        case HttpResponse(StatusCodes.OK, _, entity, _) =>
          val resultStr = entity.dataBytes.runFold(ByteString(""))(_ ++ _).map(_.utf8String)

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


  def executeDirect(sqlBuffer: mutable.Buffer[String], projectSql: String, sourceConfig: SourceConfig, pageInfo: PageInfo, cacheInfo: CacheInfo): (Seq[String], Long) = {
    sqlBuffer.remove(sqlBuffer.length - 1)
    sqlBuffer.append(projectSql)
    val seq: Seq[String] = if (cacheIsEnable) {
      if (cacheInfo.useCache) queryCache(RequestInfo(sqlBuffer, sourceConfig, cacheInfo.expired))
      else {
        if (cacheInfo.expired > 0) {
          //update cache
          logger.info(s"cache expired time >0,expired:${cacheInfo.expired}")
          val res = sqlExecute(sourceConfig, sqlBuffer)
          JedisConnection.set(sqlBuffer.mkString(";"), res.toList, cacheInfo.expired)
          logger.info(s"update cache in cacheInfo expired >0 (:)(:)(:)(:)(:)(:)(:)")
          res
        } else sqlExecute(sourceConfig, sqlBuffer)
      }
    } else sqlExecute(sourceConfig, sqlBuffer)
    (seq, -1)
  }


  def queryCache(requestInfo: RequestInfo): Seq[String] = {
    import akka.pattern.ask
    import scala.collection.JavaConversions._
    implicit val timeout = Timeout(requestTimeout, TimeUnit.SECONDS)
    try {
      val resFromJedis = JedisConnection.getList(requestInfo.sqlBuffer.mkString(";"))
      if (resFromJedis.size != 0) {
        logger.info("query from redis(:)(:)(:)(:)(:)")
        resFromJedis
      }
      else {
        logger.info("query from redis size =0 ,then send to actor")
        val f = (ActorSys.getActor ? requestInfo).mapTo[Future[Seq[String]]]
        val resFuture: Future[Seq[String]] = for (o <- f; i <- o) yield i
        Await.result(resFuture, new FiniteDuration(requestTimeout, SECONDS))
      }
    } catch {
      case e: Throwable =>
        logger.error("query cache exception", e)
        throw e
    }
  }


  def mergeAndRender(sql: String,
                     paramSeq: Seq[KV] = null,
                     groupParams: Seq[KV] = null): mutable.Buffer[String] = {
    val sqlArr =
      if (sql.lastIndexOf(sqlSeparator) == sql.length - 1) sql.dropRight(1).split(sqlSeparator)
      else sql.split(sqlSeparator)
    val groupKVMap = getGroupKVMap(sqlArr, groupParams)
    val queryKVMap = getQueryKVMap(sqlArr, paramSeq)
    val sqlWithoutVar = sql.substring(sql.indexOf(STStartChar) + 1, sql.indexOf(STEndChar)).trim
    logger.info("sql without var defined: " + sqlWithoutVar)
    val mergeSql =
      if (groupKVMap.nonEmpty) RegexMatcher.matchAndReplace(sqlWithoutVar, groupKVMap)
      else sqlWithoutVar
    logger.info("sql after group merge: " + mergeSql)
    val renderedSql = if (queryKVMap.nonEmpty) STRenderUtils.renderSql(mergeSql, queryKVMap) else mergeSql
    logger.info("sql after query var render: " + renderedSql)
    val trimRenderSql = renderedSql.trim
    val resetSql =
      if (trimRenderSql.lastIndexOf(sqlSeparator) == trimRenderSql.length - 1)
        trimRenderSql.dropRight(1).split(sqlSeparator) else trimRenderSql.split(sqlSeparator)
    resetSql.toBuffer
  }


  def getGroupKVMap(sqlArr: Array[String], groupParams: Seq[KV]): mutable.HashMap[String, List[String]] = {
    val defaultVars = sqlArr.filter(_.contains(groupVar))
    val groupKVMap = mutable.HashMap.empty[String, List[String]]
    try {
      if (null != groupParams && groupParams.nonEmpty)
        groupParams.foreach(group => {
          val (k, v) = (group.k, group.v)
          if (groupKVMap.contains(k))
            groupKVMap(k) = groupKVMap(k) ::: List(v)
          else groupKVMap(k) = List(v)
        })
      if (defaultVars.nonEmpty)
        defaultVars.foreach(g => {
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
    val defaultVars = sqlArr.filter(_.contains(queryVar))
    val queryKVMap = mutable.HashMap.empty[String, String]
    try {
      if (null != paramSeq && paramSeq.nonEmpty) paramSeq.foreach(param => queryKVMap(param.k) = param.v)
      if (defaultVars.nonEmpty)
        defaultVars.foreach(g => {
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

  def sqlExecute(sourceConfig: SourceConfig, sqlBuffer: mutable.Buffer[String]): Seq[String] = {
    logger.info("the sql in getResult:")
    sqlBuffer.foreach(logger.info)
    var dbConnection: Connection = null
    var statement: Statement = null
    try {
      dbConnection = SqlUtils.getConnection(sourceConfig.url, sourceConfig.user, sourceConfig.password, 10)
      statement = dbConnection.createStatement()
      //      statement.setFetchSize(fetchSize)
      if (sqlBuffer.length > 1) for (elem <- sqlBuffer.dropRight(1)) statement.execute(elem)
      val resultSet = dbConnection.prepareStatement(sqlBuffer.last).executeQuery()
      covert2ListBuf(resultSet, sourceConfig)
    } catch {
      case e: Throwable => logger.error("get result exception", e)
        throw e
    } finally {
      //      if (statement != null) statement.close()
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

  def getProjectSql(querySql: String, tableName: String, sourceConfig: SourceConfig, pageInfo: PageInfo = null, manualInfo: ManualInfo = null): String = {
    logger.info("the initial project sql: " + querySql)
    val (filters, adHocSql) = if (null != manualInfo) (manualInfo.manualFilters.orNull, manualInfo.adHoc.orNull)
    else (null, null)
    val projectSqlWithFilter =
      if (null != filters && filters != "") s"SELECT * FROM ($querySql) AS PROFILTER WHERE $filters" else querySql
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

