/*-
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
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


package edp.davinci.rest.view

import java.sql.SQLException
import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.module.{ConfigurationModule, PersistenceModule, _}
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import edp.davinci.util.common.ResponseUtils._
import edp.davinci.util.common.{AuthorizationProvider, DavinciConstants}
import edp.davinci.util.json.JsonProtocol._
import edp.davinci.util.json.JsonUtils
import edp.davinci.util.sql.SqlUtils
import edp.davinci.util.sql.SqlUtils.{filterAnnotation, getDefaultVarMap, toArray}
import io.swagger.annotations._
import org.slf4j.LoggerFactory

import scala.collection.mutable
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.{FiniteDuration, _}
import scala.util.{Failure, Success}

@Api(value = "/flattables", consumes = "application/json", produces = "application/json")
@Path("/flattables")
class ViewRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  val routes: Route = postViewRoute ~ putViewRoute ~ getViewByAllRoute ~ deleteViewRoute ~ getGroupsByViewIdRoute ~ getResultRoute ~ deleteRelation ~ sqlVerifyRoute ~ markRoute ~ distinctFieldValueRequest
  private lazy val logger = LoggerFactory.getLogger(this.getClass)
  private lazy val waitTimeout = 30
  private lazy val adHocTable = "table"
  private lazy val routeName = "flattables"
  private lazy val DEFAULT_REL_CONFIG ="""{"authority":["share", "download"]}"""


  @ApiOperation(value = "get all views", notes = "", nickname = "", httpMethod = "GET")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request"),
    new ApiResponse(code = 404, message = "not found")
  ))
  def getViewByAllRoute: Route = path(routeName) {
    get {
      authenticateOAuth2Async(AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            onComplete(ViewService.getAllViews(session)) {
              case Success(viewSeq) =>
                complete(OK, ResponseSeqJson[QueryView](getHeader(200, session), viewSeq))
              case Failure(ex) =>
                logger.error(" get views exception", ex)
                complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, "user is not admin", session), ""))
      }
    }
  }


  @ApiOperation(value = "Add new view to the system", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(new ApiImplicitParam(name = "views", value = "view objects to be added", required = true, dataType = "edp.davinci.persistence.entities.View4PostSeq", paramType = "body")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request"),
    new ApiResponse(code = 405, message = "unspecified error")
  ))
  def postViewRoute: Route = path(routeName) {
    post {
      entity(as[View4PostSeq]) { view4Post =>
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) { session =>
          val view4PostSeq = view4Post.payload
          if (session.admin) {
            val uniqueTableName = adHocTable + java.util.UUID.randomUUID().toString
            val views: Seq[View] = view4PostSeq.map(v => View(0, v.source_id, v.name, v.sql_tmpl, v.update_sql, uniqueTableName, Some(v.desc), v.trigger_type, v.frequency, v.`catch`, active = true, currentTime, session.userId, currentTime, session.userId))
            val query = for {
              insertViews <- modules.viewDal.insert(views)
              rel <- {
                val relSeq = for {view <- insertViews
                                  rel <- view4PostSeq.head.relBG
                } yield RelGroupView(0, rel.group_id, view.id, Some(rel.sql_params), rel.config.getOrElse(DEFAULT_REL_CONFIG), active = true, currentTime, session.userId, currentTime, session.userId)
                modules.relGroupViewDal.insert(relSeq)
              }
            } yield (insertViews, rel)
            onComplete(query) {
              case Success(tuple) =>
                val queryView = tuple._1.map(v => QueryView(v.id, v.source_id, v.name, v.sql_tmpl, v.update_sql, v.desc, v.trigger_type, v.frequency, v.`catch`, v.result_table, active = true, v.create_by))
                complete(OK, ResponseSeqJson[QueryView](getHeader(200, session), queryView))
              case Failure(ex) => logger.error("modules.relGroupViewDal.insert error", ex)
                complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
        }
      }
    }
  }

  @ApiOperation(value = "update views in the system", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(new ApiImplicitParam(name = "view", value = "view objects to be updated", required = true, dataType = "edp.davinci.persistence.entities.View4PutSeq", paramType = "body")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "put success"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 405, message = "put view error")
  ))
  def putViewRoute: Route = path(routeName) {
    put {
      entity(as[View4PutSeq]) { view4Put =>
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) { session =>
          if (session.admin) {
            val view4PutSeq = view4Put.payload
            val create_by = Await.result(modules.viewDal.findById(view4PutSeq.head.id), new FiniteDuration(waitTimeout, SECONDS)).get.create_by
            if (create_by == session.userId) {
              val relationSeq = view4PutSeq.head.relBG.map(r => RelGroupView(0, r.group_id, view4PutSeq.head.id, Some(r.sql_params), r.config.getOrElse(DEFAULT_REL_CONFIG), active = true, currentTime, session.userId, currentTime, session.userId))
              val operation = for {
                view <- ViewService.updateView(view4PutSeq, session)
                relation <- modules.relGroupViewDal.insert(relationSeq)
              } yield (view, relation)
              onComplete(operation) {
                case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
                case Failure(ex) => logger.error("modules.relGroupViewDal.insert error", ex)
                  complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
              }
            } else complete(BadRequest, ResponseJson[String](getHeader(400, "permission denied,con not update view created by others", session), ""))
          } else complete(BadRequest, ResponseJson[String](getHeader(400, session), ""))
        }
      }
    }
  }

  @Path("/{id}")
  @ApiOperation(value = "delete view by id", notes = "", nickname = "", httpMethod = "DELETE")
  @ApiImplicitParams(Array(new ApiImplicitParam(name = "id", value = "view id", required = true, dataType = "integer", paramType = "path")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "delete success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def deleteViewRoute: Route = path(routeName / LongNumber) { viewId =>
    delete {
      authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            val view = Await.result(modules.viewDal.findById(viewId), new FiniteDuration(waitTimeout, SECONDS))
            if (view.nonEmpty) {
              if (session.userId == view.get.create_by)
                onComplete(ViewService.deleteView(viewId, session)) {
                  case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
                  case Failure(ex) => logger.error("deleteViewByIdRoute error", ex)
                    complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
                } else complete(BadRequest, ResponseJson[String](getHeader(400, "permission denied, con not delete the one created by others", session), ""))
            } else complete(BadRequest, ResponseJson[String](getHeader(400, "view not found", session), ""))
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
      }
    }
  }

  @Path("/groups/{rel_id}")
  @ApiOperation(value = "delete view from group by rel id", notes = "", nickname = "", httpMethod = "DELETE")
  @ApiImplicitParams(Array(new ApiImplicitParam(name = "rel_id", value = "rel_id", required = true, dataType = "integer", paramType = "path")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "delete success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def deleteRelation: Route = path(routeName / "groups" / LongNumber) { relId =>
    delete {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            onComplete(modules.relGroupViewDal.deleteById(relId).mapTo[Int]) {
              case Success(r) => complete(OK, ResponseJson[Int](getHeader(200, session), r))
              case Failure(ex) => logger.error("deleteRelGFById error", ex)
                complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
      }
    }
  }

  @Path("/{id}/groups")
  @ApiOperation(value = "get groups by view id", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(new ApiImplicitParam(name = "id", value = "flat table id", required = true, dataType = "integer", paramType = "path")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "ok"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 405, message = "internal get error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getGroupsByViewIdRoute: Route = path(routeName / LongNumber / "groups") { viewId =>
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(ViewService.getGroupViewRelation(viewId)) {
            case Success(relSeq) =>
              val putRelSeq = relSeq.map(r => PutRelGroupView(r._1, r._2, r._3, Some(r._4)))
              complete(OK, ResponseSeqJson[PutRelGroupView](getHeader(200, session), putRelSeq))
            case Failure(ex) => logger.error("getGroupsByViewIdRoute error", ex)
              complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    }
  }


  @Path("/{id}/resultset")
  @ApiOperation(value = "get calculation results by biz id", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", value = "view id", required = true, dataType = "integer", paramType = "path"),
    new ApiImplicitParam(name = "manualInfo", value = "manualInfo", required = false, dataType = "edp.davinci.rest.ManualInfo", paramType = "body"),
    new ApiImplicitParam(name = "offset", value = "offset", required = false, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "limit", value = "limit", required = false, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "sortby", value = "sort by", required = false, dataType = "string", paramType = "query"),
    new ApiImplicitParam(name = "usecache", value = "true or false", required = false, dataType = "boolean", paramType = "query"),
    new ApiImplicitParam(name = "expired", value = "seconds", required = false, dataType = "integer", paramType = "query")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "ok"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getResultRoute: Route = path(routeName / LongNumber / "resultset") { viewId =>
    post {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          entity(as[ManualInfo]) { manualInfo =>
            parameters('offset.as[Int] ? -1, 'limit.as[Int] ? -1, 'sortby.as[String] ? "", 'usecache.as[Boolean] ? true, 'expired.as[Int] ? 300) {
              (offset, limit, sortBy, useCache, expired) =>
                new QueryHelper(session, viewId, Paginate(limit, offset, sortBy), CacheClass(useCache, expired), DavinciConstants.appJson, manualInfo).getResultComplete
            }
          }
      }
    }
  }


  @Path("/{id}/mark")
  @ApiOperation(value = "mark the view", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", value = "view id", required = true, dataType = "integer", paramType = "path"),
    new ApiImplicitParam(name = "manualInfo", value = "manualInfo", required = false, dataType = "edp.davinci.rest.ManualInfo", paramType = "body")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "ok"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def markRoute: Route = path(routeName / LongNumber / "mark") { viewId =>
    post {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          entity(as[ManualInfo]) { manualInfo =>
            new UpdateHelper(session, viewId, manualInfo).doUpdate()

          }
      }
    }
  }


  @Path("/{source_id}")
  @ApiOperation(value = "sql verify", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "source_id", value = "source id", required = true, dataType = "integer", paramType = "path"),
    new ApiImplicitParam(name = "sql written by admin", value = "sql", required = false, dataType = "String", paramType = "body")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "ok"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def sqlVerifyRoute: Route = path(routeName / LongNumber) {
    sourceId =>
      post {
        entity(as[String]) { sqlTemplate =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) { _ =>
            val source = Await.result(modules.sourceDal.findById(sourceId), new FiniteDuration(waitTimeout, SECONDS)).get
            try {
              if (sqlTemplate.trim != "") {
                val filteredSql = filterAnnotation(sqlTemplate.trim)
                val mergeSql = new GroupVar(Seq.empty, getDefaultVarMap(filteredSql, "group")).replace(filteredSql)
                logger.info("@@sql after group merge: " + mergeSql)
                val renderedSql = new QueryVar(Seq.empty, getDefaultVarMap(filteredSql, "query")).render(mergeSql)
                logger.info("@@sql after query var render: " + renderedSql)
                val renderedSQLBuf: mutable.Buffer[String] = getSqlBuffer(renderedSql, source.connection_url)
                val sourceConfig = JsonUtils.json2caseClass[SourceConfig](source.connection_url)
                val resultList = QueryHelper.executeQuery(renderedSQLBuf, sourceConfig)
                QueryHelper.contentTypeMatch(resultList, DavinciConstants.appJson)
              }
              else complete(BadRequest, ResponseJson[String](getHeader(400, "flatTable sql template is empty", null), ""))
            } catch {
              case sqlEx: SQLException =>
                logger.error("SQLException", sqlEx)
                complete(BadRequest, ResponseJson[String](getHeader(400, sqlEx.getMessage, null), "sql语法错误"))
              case ex: Throwable =>
                logger.error("error in get result complete ", ex)
                complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), "获取数据异常"))
            }
          }
        }
      }
  }

  private def getSqlBuffer(sql: String, url: String): mutable.Buffer[String] = {
    val renderedSQLBuf: mutable.Buffer[String] = toArray(sql).toBuffer
    val sourceConfig = JsonUtils.json2caseClass[SourceConfig](url)
    val projectSql: String =
      if (!QueryHelper.isES(sourceConfig.url))
        s"SELECT * FROM (${renderedSQLBuf.last}) AS SQLVERIFY WHERE 1 = 0"
      else renderedSQLBuf.last
    renderedSQLBuf.remove(renderedSQLBuf.length - 1)
    renderedSQLBuf.append(projectSql)
    renderedSQLBuf
  }


  @Path("/{id}/distinct_value")
  @ApiOperation(value = "distinct filed value request", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", value = "view id", required = true, dataType = "integer", paramType = "path"),
    new ApiImplicitParam(name = "distinct_field", value = "Distinct Field", required = false, dataType = "edp.davinci.rest.DistinctFieldValueRequest", paramType = "body")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "ok"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def distinctFieldValueRequest: Route = path(routeName / LongNumber / "distinct_value") { viewId =>
      post {
        entity(as[DistinctFieldValueRequest]) { distinctFieldValueRequest =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) { session =>
            val queryHelper = new QueryHelper(session, viewId,
              contentType = DavinciConstants.appJson,
              manualInfo = ManualInfo(distinctFieldValueRequest.adHoc,
                distinctFieldValueRequest.manualFilters, distinctFieldValueRequest.params))
            val mergeSql = queryHelper.groupVarMerge()
            val renderedSql = queryHelper.queryVarRender(mergeSql)
            val sqlBuffer: mutable.Buffer[String] = toArray(renderedSql).toBuffer
            val projectSql = queryHelper.getProjectSql(sqlBuffer.last)
            val distinctValueSql = SqlUtils.getDistinctSql(projectSql, distinctFieldValueRequest)
            logger.info(s"@@distinctValueSql $distinctValueSql")
            sqlBuffer.remove(sqlBuffer.length - 1)
            sqlBuffer.append(distinctValueSql)
            val resultSeq = queryHelper.executeDirect(sqlBuffer)
            QueryHelper.contentTypeMatch(resultSeq, DavinciConstants.appJson)
          }
        }
      }
  }


}
