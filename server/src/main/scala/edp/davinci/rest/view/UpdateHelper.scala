package edp.davinci.rest.view

import java.sql.{Connection, SQLException, Statement}

import akka.http.scaladsl.model.StatusCodes.{BadRequest, OK}
import akka.http.scaladsl.server.{Directives, StandardRoute}
import edp.davinci.KV
import edp.davinci.persistence.entities.SourceConfig
import edp.davinci.rest.{ManualInfo, ResponseJson, SessionClass}
import edp.davinci.util.common.DavinciConstants.requestTimeout
import edp.davinci.util.common.ResponseUtils.getHeader
import edp.davinci.util.json.JsonProtocol._
import edp.davinci.util.json.JsonUtils
import edp.davinci.util.json.JsonUtils.json2caseClass
import edp.davinci.util.sql.SqlUtils
import edp.davinci.util.sql.SqlUtils.{filterAnnotation, getDefaultVarMap, toArray}
import org.slf4j.LoggerFactory

import scala.collection.mutable
import scala.concurrent.Await
import scala.concurrent.duration.{FiniteDuration, SECONDS}

class UpdateHelper(session: SessionClass, viewId: Long,manualInfo: ManualInfo) extends Directives{
  private val logger = LoggerFactory.getLogger(this.getClass)
  private lazy val source = Await.result(ViewService.getUpdateSource(viewId, session), new FiniteDuration(requestTimeout, SECONDS))

  def doUpdate(): StandardRoute = {
    val source = Await.result(ViewService.getUpdateSource(viewId, session), new FiniteDuration(requestTimeout, SECONDS))
    if (source.nonEmpty) {
      try {
        val updateSql_get = source.head.updateSql.getOrElse("").trim
        if (updateSql_get != "") {
          logger.info("the sqlTemp written by admin:" + updateSql_get)
          val mergeSql = groupVarMerge()
          logger.info("sql after group merge: " + mergeSql)
          val renderedSql = queryVarRender(mergeSql)
          logger.info("sql after query var render: " + renderedSql)
          val sqlBuffer: mutable.Buffer[String] = toArray(renderedSql).toBuffer
          val sourceConfig = JsonUtils.json2caseClass[SourceConfig](source.head.url)
          executeUpdate(sourceConfig, sqlBuffer)
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

  def groupVarMerge(): String = {
    val filteredSql = filterAnnotation(source.head.updateSql.get.trim)
    val groupParams = source.map(_.sql_param.getOrElse(Some("")).get).filter(_.trim != "").flatMap(json2caseClass[Seq[KV]])
    new GroupVar(groupParams, getDefaultVarMap(filteredSql, "group")).replace(filteredSql)
  }


  def queryVarRender(mergedSql: String): String = {
    val filteredSql = filterAnnotation(source.head.updateSql.get.trim)
    val queryParams = if (null != manualInfo) manualInfo.params.orNull else null
    new QueryVar(queryParams, getDefaultVarMap(filteredSql, "query")).render(mergedSql)

  }

}

