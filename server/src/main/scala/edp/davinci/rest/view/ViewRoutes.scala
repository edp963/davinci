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


package edp.davinci.rest.view

import java.sql.SQLException
import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.module.{ConfigurationModule, PersistenceModule, _}
import edp.davinci.persistence.entities._
import edp.davinci.rest.RouteHelper.{contentTypeMatch, executeDirect, getProjectSql, mergeAndRender}
import edp.davinci.rest._
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.ResponseUtils._
import edp.davinci.util.SqlUtils.filterAnnotation
import edp.davinci.util.{AuthorizationProvider, DavinciConstants, JsonUtils}
import io.swagger.annotations._
import org.slf4j.LoggerFactory

import scala.collection.mutable
import scala.concurrent.{Await, Future}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.{FiniteDuration, _}
import scala.util.{Failure, Success}

@Api(value = "/flattables", consumes = "application/json", produces = "application/json")
@Path("/flattables")
class ViewRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  val routes: Route = postViewRoute ~ putViewRoute ~ getViewByAllRoute ~ deleteViewByIdRoute ~ getGroupsByViewIdRoute ~ getResultRoute ~ deleteRelGFById ~ sqlVerifyRoute ~ markRoute
  private lazy val logger = LoggerFactory.getLogger(this.getClass)
  private lazy val adHocTable = "table"
  private lazy val routeName = "flattables"


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
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
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
  @ApiImplicitParams(Array(new ApiImplicitParam(name = "views", value = "view objects to be added", required = true, dataType = "edp.davinci.persistence.entities.PostViewInfoSeq", paramType = "body")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request"),
    new ApiResponse(code = 405, message = "unspecified error")
  ))
  def postViewRoute: Route = path(routeName) {
    post {
      entity(as[PostViewInfoSeq]) { putViewSeq =>
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) { session =>
          val viewSeq = putViewSeq.payload
          if (session.admin) {
            val uniqueTableName = adHocTable + java.util.UUID.randomUUID().toString
            val bizEntitySeq: Seq[View] = viewSeq.map(v => View(0, v.source_id, v.name, v.sql_tmpl, v.update_sql, uniqueTableName, Some(v.desc), v.trigger_type, v.frequency, v.`catch`, active = true, currentTime, session.userId, currentTime, session.userId))
            val query = for {
              bizSeq <- modules.viewDal.insert(bizEntitySeq)
              rel <- {
                val relSeq = for {biz <- bizSeq
                                  rel <- viewSeq.head.relBG
                } yield RelGroupView(0, rel.group_id, biz.id, Some(rel.sql_params), active = true, currentTime, session.userId, currentTime, session.userId)
                modules.relGroupViewDal.insert(relSeq)
              }
            } yield (bizSeq, rel)
            onComplete(query) {
              case Success(tuple) =>
                val queryBiz = tuple._1.map(v => QueryView(v.id, v.source_id, v.name, v.sql_tmpl, v.update_sql, v.desc, v.trigger_type, v.frequency, v.`catch`, v.result_table, active = true, v.create_by))
                complete(OK, ResponseSeqJson[QueryView](getHeader(200, session), queryBiz))
              case Failure(ex) => logger.error("modules.relGroupViewDal.insert error", ex)
                complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
        }
      }
    }
  }

  @ApiOperation(value = "update views in the system", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(new ApiImplicitParam(name = "view", value = "view objects to be updated", required = true, dataType = "edp.davinci.persistence.entities.PutViewInfoSeq", paramType = "body")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "put success"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 405, message = "put view error")
  ))
  def putViewRoute: Route = path(routeName) {
    put {
      entity(as[PutViewInfoSeq]) { putViewSeq =>
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) { session =>
          if (session.admin) {
            val viewSeq = putViewSeq.payload
            val create_by = Await.result(modules.viewDal.findById(viewSeq.head.id), new FiniteDuration(30, SECONDS)).get.create_by
            if (create_by == session.userId)
              onComplete(ViewService.updateFlatTbl(viewSeq, session)) {
                case Success(_) => val relSeq = for {rel <- viewSeq.head.relBG
                } yield RelGroupView(0, rel.group_id, viewSeq.head.id, Some(rel.sql_params), active = true, currentTime, session.userId, currentTime, session.userId)
                  onComplete(modules.relGroupViewDal.insert(relSeq)) {
                    case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
                    case Failure(ex) => logger.error("modules.relGroupViewDal.insert error", ex)
                      complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
                  }
                case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
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
  def deleteViewByIdRoute: Route = path(routeName / LongNumber) { viewId =>
    delete {
      authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            val view = Await.result(modules.viewDal.findById(viewId), new FiniteDuration(30, SECONDS))
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
  def deleteRelGFById: Route = path(routeName / "groups" / LongNumber) { relId =>
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
          val future = ViewService.getGroups(viewId)
          onComplete(future) {
            case Success(relSeq) =>
              val putRelSeq = relSeq.map(r => PutRelGroupView(r._1, r._2, r._3))
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
                RouteHelper.getResultComplete(session, viewId, Paginate(limit, offset, sortBy), CacheClass(useCache, expired), DavinciConstants.appJson, manualInfo)
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
            RouteHelper.doUpdate(session, viewId, manualInfo)
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
        entity(as[String]) {
          sqlTmp =>
            authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
              _ =>
                val source = Await.result(modules.sourceDal.findById(sourceId), new FiniteDuration(30, SECONDS)).get
                try {
                  if (sqlTmp.trim != "") {
                    val trimSql = sqlTmp.trim
                    logger.info("the sqlTemp written by admin:\n" + trimSql)
                    val filterSql = filterAnnotation(trimSql)
                    val resetSqlBuffer: mutable.Buffer[String] = mergeAndRender(filterSql)
                    val pageInfo = Paginate(10, -1, "")
                    val sourceConfig = JsonUtils.json2caseClass[SourceConfig](source.connection_url)
                    val projectSql = getProjectSql(resetSqlBuffer.last, "SQLVERIFY", sourceConfig, pageInfo)
                    logger.info("the projectSql get from sql template:\n" + projectSql)
                    val resultList = executeDirect(resetSqlBuffer, projectSql, sourceConfig, pageInfo, CacheClass(false, 0))
                    contentTypeMatch(resultList, DavinciConstants.appJson)
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
}
