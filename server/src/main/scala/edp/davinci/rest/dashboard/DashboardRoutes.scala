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





package edp.davinci.rest.dashboard

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.module._
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import edp.davinci.rest.dashboard.DashboardService._
import edp.davinci.util.AuthorizationProvider
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.ResponseUtils._
import io.swagger.annotations.{ApiImplicitParams, _}
import org.apache.log4j.Logger

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.{FiniteDuration, SECONDS}
import scala.util.{Failure, Success}

@Api(value = "/dashboards", consumes = "application/json", produces = "application/json")
@Path("/dashboards")
class DashboardRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  val routes: Route = getDashboardByIdRoute ~ postDashboardRoute ~ putDashboardRoute ~ addWidgets ~ getDashboardsRoute ~
    deleteDashboardRoute ~ deleteRelationRoute ~ addWidgets ~ putWidgetInDashboardRoute ~ nameCheckRoute
  private lazy val routeName = "dashboards"
  private lazy val logger = Logger.getLogger(this.getClass)


  @Path("/{dashboard_id}")
  @ApiOperation(value = "get one dashboard from system by id", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "dashboard_id", value = "dashboard id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 404, message = "dashboard not found"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getDashboardByIdRoute: Route = path(routeName / LongNumber) { dashboardId =>
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session => getDashboardById(dashboardId, session)
      }
    }
  }

  def getDashboardById(dashboardId: Long, session: SessionClass): Route = {
    val operation = for {
      relation <- getRelation(session, dashboardId)
      dashboard <- getDashBoard(dashboardId)
    } yield (relation, dashboard)
    onComplete(operation) {
      case Success(tuple) =>
        val (relations, dashboards) = tuple
        dashboards match {
          case Some(dashboard) =>
            val dashboardContent = DashboardContent(dashboard.id, dashboard.name, dashboard.pic.getOrElse(""), dashboard.desc, dashboard.linkage_detail.getOrElse(""),dashboard.config, dashboard.publish, dashboard.create_by, relations)
            complete(OK, ResponseJson[DashboardContent](getHeader(200, session), dashboardContent))
          case None =>
            logger.error(s"dashboard not found,id:$dashboardId")
            complete(BadRequest, ResponseJson[String](getHeader(400, s"not found dashboard: $dashboardId", session), ""))
        }
      case Failure(ex) =>
        logger.error(s"get dashboard or getInsideInfo error", ex)
        complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
    }
  }

  @ApiOperation(value = "get all dashboards with the same domain", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "active", value = "true or false", required = false, dataType = "boolean", paramType = "query")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 403, message = "dashboard is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getDashboardsRoute: Route = path(routeName) {
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(getAll(session)) {
            case Success(dashboardSeq) =>
              complete(OK, ResponseSeqJson[PutDashboard](getHeader(200, session), dashboardSeq))
            case Failure(ex) =>
              logger.error(s"get all dashboards error", ex)
              complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    }
  }

  @ApiOperation(value = "Add new dashboards to the system", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "dashboards", value = "Dashboard objects to be added", required = true, dataType = "edp.davinci.persistence.entities.PostDashboardSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "dashboard is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def postDashboardRoute: Route = path(routeName) {
    post {
      entity(as[PostDashboardSeq]) {
        dashboards =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => postDashBoard(session, dashboards.payload)
          }
      }
    }
  }

  def postDashBoard(session: SessionClass, postDashboards: Seq[PostDashboard]): Route = {
    if (session.admin) {
      val dashboardSeq = postDashboards.map(post => Dashboard(0, post.name, Some(post.pic), post.desc, Some(post.linkage_detail),Some(post.config.getOrElse("{}")), post.publish, active = true, currentTime, session.userId, currentTime, session.userId))
      onComplete(modules.dashboardDal.insert(dashboardSeq)) {
        case Success(dashboards) =>
          val responseDashSeq = dashboards.map(dashboard => PutDashboard(dashboard.id, dashboard.name, dashboard.pic, dashboard.desc, dashboard.linkage_detail,dashboard.config, dashboard.publish, dashboard.active, dashboard.create_by))
          complete(OK, ResponseSeqJson[PutDashboard](getHeader(200, session), responseDashSeq))
        case Failure(ex) => logger.error(s"insert dashboard error", ex)
          complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @ApiOperation(value = "update dashboards in the system", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "dashboard", value = "Dashboard objects to be updated", required = true, dataType = "edp.davinci.persistence.entities.PutDashboardSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "put success"),
    new ApiResponse(code = 403, message = "dashboard is not admin"),
    new ApiResponse(code = 404, message = "dashboards not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def putDashboardRoute: Route = path(routeName) {
    put {
      entity(as[PutDashboardSeq]) {
        dashboardSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => putDashboard(session, dashboardSeq.payload)
          }
      }
    }
  }

  def putDashboard(session: SessionClass, dashboardSeq: Seq[PutDashboard]): Route = {
    if (session.admin) {
      val create_by = Await.result(modules.dashboardDal.findById(dashboardSeq.head.id), new FiniteDuration(30, SECONDS)).get.create_by
      if (create_by == session.userId) {
        onComplete(update(session, dashboardSeq)) {
          case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
          case Failure(ex) => logger.error(s"update dashboard error", ex)
            complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
        }
      } else complete(BadRequest, ResponseJson[String](getHeader(400, "permission denied ,con not update dashboard created by others", session), ""))
    }
    else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }

  @Path("/{id}")
  @ApiOperation(value = "delete dashboard by id", notes = "", nickname = "", httpMethod = "DELETE")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", value = "dashboard id ", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "delete success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def deleteDashboardRoute: Route = path(routeName / LongNumber) { dashboardId =>
    delete {
      authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            val dashboard = Await.result(modules.dashboardDal.findById(dashboardId), new FiniteDuration(30, SECONDS))
            if (dashboard.nonEmpty) {
              if (session.userId == dashboard.get.create_by)
                onComplete(deleteDashboard(dashboardId, session)) {
                  case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
                  case Failure(ex) => logger.error(s"delete dashboard error", ex)
                    complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
                } else complete(BadRequest, ResponseJson[String](getHeader(400, "permission denied, con not delete dashboard create by others", session), ""))
            } else complete(BadRequest, ResponseJson[String](getHeader(400, "dashboard not found", session), ""))
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
      }
    }
  }

  @Path("/widgets")
  @ApiOperation(value = "add widgets to a dashboard", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "relDashboardWidget", value = "RelDashboardWidget objects to be added", required = true, dataType = "edp.davinci.persistence.entities.PostRelDashboardWidgetSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def addWidgets: Route = path(routeName / "widgets") {
    post {
      entity(as[PostRelDashboardWidgetSeq]) {
        relationSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => addWidgets(session, relationSeq.payload)
          }
      }
    }
  }

  def addWidgets(session: SessionClass, postRelDWSeq: Seq[PostRelDashboardWidget]): Route = {
    if (session.admin) {
      val create_by = Await.result(modules.dashboardDal.findById(postRelDWSeq.head.dashboard_id), new FiniteDuration(30, SECONDS)).get.create_by
      if (create_by == session.userId) {
        val relDWSeq = postRelDWSeq.map(post => RelDashboardWidget(0, post.dashboard_id, post.widget_id, post.position_x, post.position_y, post.length, post.width, post.trigger_type, post.trigger_params, active = true, currentTime, session.userId, currentTime, session.userId))
        onComplete(modules.relDashboardWidgetDal.insert(relDWSeq)) {
          case Success(relations) =>
            val responseRelDWSeq = relations.map(rel => PutRelDashboardWidget(rel.id, rel.dashboard_id, rel.widget_id, rel.position_x, rel.position_y, rel.length, rel.width, rel.trigger_type, rel.trigger_params))
            complete(OK, ResponseSeqJson[PutRelDashboardWidget](getHeader(200, session), responseRelDWSeq))
          case Failure(ex) => logger.error(s"modules.relDashboardWidgetDal.insert error", ex)
            complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
        }
      } else complete(BadRequest, ResponseJson[String](getHeader(400, "permission denied,con not add widget to the dashboard created by others", session), ""))
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @Path("/widgets")
  @ApiOperation(value = "update widgets in the dashboard", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "relDashboardWidget", value = "RelDashboardWidget objects to be added", required = true, dataType = "edp.davinci.persistence.entities.PutRelDashboardWidgetSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "update success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def putWidgetInDashboardRoute: Route = path(routeName / "widgets") {
    put {
      entity(as[PutRelDashboardWidgetSeq]) {
        relationPut =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => updateWidgetLayout(session, relationPut.payload)
          }
      }
    }
  }

  def updateWidgetLayout(session: SessionClass, relSeq: Seq[PutRelDashboardWidget]): Route = {
    if (session.admin) {
      val create_by = Await.result(modules.dashboardDal.findById(relSeq.head.dashboard_id), new FiniteDuration(30, SECONDS)).get.create_by
      if (create_by == session.userId) {
        onComplete(updateRelation(session, relSeq)) {
          case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
          case Failure(ex) => logger.error(s"updateWidgetInDashboard error", ex)
            complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
        }
      } else complete(BadRequest, ResponseJson[String](getHeader(400, "permission denied,con not update dashboard created by others", session), ""))
    }
    else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @Path("/widgets/{rel_id}")
  @ApiOperation(value = "delete widget from dashboard by id", notes = "", nickname = "", httpMethod = "DELETE")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "rel_id", value = "relation id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "delete success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def deleteRelationRoute: Route = path(routeName / "widgets" / LongNumber) { relId =>
    delete {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            val relation = Await.result(modules.relDashboardWidgetDal.findById(relId), new FiniteDuration(30, SECONDS))
            if (relation.nonEmpty) {
              if (session.userId == relation.get.create_by)
                onComplete(deleteRelation(relId, session)) {
                  case Success(r) => complete(OK, ResponseJson[Int](getHeader(200, session), r))
                  case Failure(ex) => logger.error(s"deleteWidgetFromDashboardRoute error", ex)
                    complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
                } else complete(BadRequest, ResponseJson[String](getHeader(400, "relation con not found", session), ""))
            } else complete(BadRequest, ResponseJson[String](getHeader(400, "permission denied,con not delete the one created by others", session), ""))
          }
          else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
      }
    }
  }


  @Path("/name/{name}")
  @ApiOperation(value = "check unique name", notes = "", nickname = "", httpMethod = "get")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "name", value = "name", required = true, dataType = "string", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "correct name"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def nameCheckRoute: Route = path(routeName / "name" / Segment) { name =>
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            onComplete(DashboardService.nameCheck(name)) {
              case Success(names) =>
                if (names.nonEmpty)
                  complete(OK, ResponseJson[String](getHeader(200, session), ""))
                else complete(BadRequest, ResponseJson[String](getHeader(400, "名称已被使用", session), ""))

              case Failure(ex) => logger.error(s"nameCheckRoute error", ex)
                complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          }
          else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
      }
    }
  }


}
