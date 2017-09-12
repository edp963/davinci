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

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.DavinciConstants
import edp.davinci.module.{ConfigurationModule, PersistenceModule, _}
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import edp.davinci.util.AuthorizationProvider
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.ResponseUtils._
import io.swagger.annotations._
import org.slf4j.LoggerFactory
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

@Api(value = "/flattables", consumes = "application/json", produces = "application/json")
@Path("/flattables")
class ViewRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  val routes: Route = postViewRoute ~ putViewRoute ~ getViewByAllRoute ~ deleteViewByIdRoute ~ getGroupsByViewIdRoute ~ getCalculationResRoute ~ deleteRelGFById
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
            onComplete(ViewService.getAllViews) {
              case Success(viewSeq) =>
                val queryResult = viewSeq.map(v => QueryView(v._1, v._2, v._3, v._4, v._5.getOrElse(""), v._6, v._7, v._8, v._9, active = true))
                complete(OK, ResponseSeqJson[QueryView](getHeader(200, session), queryResult))
              case Failure(ex) =>
                logger.error(" get views exception", ex)
                complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, "user is not admin", session), ""))
      }
    }
  }


  @ApiOperation(value = "Add new view to the system", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(new ApiImplicitParam(name = "views", value = "view objects to be added", required = true, dataType = "edp.davinci.rest.PostViewInfoSeq", paramType = "body")))
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
            val bizEntitySeq = viewSeq.map(v => View(0, v.source_id, v.name, v.sql_tmpl, uniqueTableName, Some(v.desc), v.trigger_type, v.frequency, v.`catch`, active = true, currentTime, session.userId, currentTime, session.userId))
            onComplete(modules.viewDal.insert(bizEntitySeq)) {
              case Success(bizSeq) =>
                val queryBiz = bizSeq.map(v => QueryView(v.id, v.source_id, v.name, v.sql_tmpl, v.desc.getOrElse(""), v.trigger_type, v.frequency, v.`catch`, v.result_table, active = true))
                val relSeq = for {biz <- bizSeq
                                  rel <- viewSeq.head.relBG
                } yield RelGroupView(0, rel.group_id, biz.id, rel.sql_params, active = true, currentTime, session.userId, currentTime, session.userId)
                onComplete(modules.relGroupViewDal.insert(relSeq)) {
                  case Success(_) => complete(OK, ResponseSeqJson[QueryView](getHeader(200, session), queryBiz))
                  case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
                }
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
        }
      }
    }
  }

  @ApiOperation(value = "update views in the system", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(new ApiImplicitParam(name = "view", value = "view objects to be updated", required = true, dataType = "edp.davinci.rest.PutViewInfoSeq", paramType = "body")))
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
          val viewSeq = putViewSeq.payload
          val operation = for {
            updateOP <- ViewService.updateFlatTbl(viewSeq, session)
            deleteOp <- modules.relGroupViewDal.deleteById(viewSeq.map(_.id))
          } yield (updateOP, deleteOp)
          onComplete(operation) {
            case Success(_) => val relSeq = for {rel <- viewSeq.head.relBG
            } yield RelGroupView(0, rel.group_id, viewSeq.head.id, rel.sql_params, active = true, currentTime, session.userId, currentTime, session.userId)
              onComplete(modules.relGroupViewDal.insert(relSeq)) {
                case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
                case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
              }
            case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
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
            val operation = for {
              deleteFlatTable <- modules.viewDal.deleteById(viewId)
              deleteRel <- ViewService.deleteFromRel(viewId)
              updateWidget <- ViewService.updateWidget(viewId)
            } yield (deleteFlatTable, deleteRel, updateWidget)
            onComplete(operation) {
              case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
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
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
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
            case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
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
    new ApiImplicitParam(name = "sortby", value = "sort by", required = false, dataType = "string", paramType = "query")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "ok"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getCalculationResRoute: Route = path(routeName / LongNumber / "resultset") { viewId =>
    post {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          entity(as[ManualInfo]) { manualInfo =>
            parameters('offset.as[Int] ? 0, 'limit.as[Int] ? -1, 'sortby.as[String] ? "") { (offset, limit, sortBy) =>
              val paginationInfo =  if (limit != -1) s" limit $limit offset $offset" else ""
              val sortInfo = if (sortBy != "") "ORDER BY " + sortBy.map(ch => if (ch == ':') ' ' else ch) else ""
              val paginateAndSort = sortInfo + paginationInfo
              val sourceFuture = ViewService.getSourceInfo(viewId, session)
              RouteHelper.getResultBySource(sourceFuture,
                DavinciConstants.appJson,
                manualInfo.manualFilters.orNull,
                manualInfo.params.orNull,
                paginateAndSort,
                manualInfo.adHoc.orNull)
            }
          }
      }
    }
  }

}
