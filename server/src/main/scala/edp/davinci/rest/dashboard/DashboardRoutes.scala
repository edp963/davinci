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
import edp.davinci.util.AuthorizationProvider
import edp.davinci.util.ResponseUtils._
import edp.davinci.util.JsonProtocol._
import io.swagger.annotations.{ApiImplicitParams, _}
import edp.davinci.rest.dashboard.DashboardService._
import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

@Api(value = "/dashboards", consumes = "application/json", produces = "application/json")
@Path("/dashboards")
class DashboardRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  val routes: Route = getWidgetByDashboardIdRoute ~ postDashboardRoute ~ putDashboardRoute ~ postWidget2DashboardRoute ~ getDashboardByAllRoute ~ deleteDashboardByIdRoute ~ deleteWidgetFromDashboardRoute ~ postWidget2DashboardRoute ~ putWidgetInDashboardRoute
  private lazy val routeName = "dashboards"


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
  def getWidgetByDashboardIdRoute: Route = path(routeName / LongNumber) { dashboard_id =>
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session => getDashboardById(dashboard_id, session)
      }
    }
  }

  def getDashboardById(dashboardId: Long, session: SessionClass): Route = {
    val operation = for {
      inside <- getInsideInfo(session, dashboardId)
      dashboard <- getDashBoard(dashboardId)
    } yield (inside, dashboard)

    onComplete(operation) {
      case Success(info) =>
        val (insideInfo, dashboards) = info
        val dashboard = dashboards.head
        val infoSeq: Seq[WidgetInfo] = insideInfo.map(r => WidgetInfo(r._1, r._2, r._3, r._4, r._5, r._6, r._7, r._8, r._9))
        val dashboardInfo = DashboardInfo(dashboard._1, dashboard._2, dashboard._3.getOrElse(""), dashboard._4, dashboard._5, infoSeq)
        complete(OK, ResponseJson[DashboardInfo](getHeader(200, session), dashboardInfo))
      case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
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
  def getDashboardByAllRoute: Route = path(routeName) {
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(getAll(session)) {
            case Success(dashboardSeq) =>
              val dashboards = dashboardSeq.map(d => PutDashboardInfo(d._1, d._2, d._3.getOrElse(""), d._4, d._5))
              complete(OK, ResponseSeqJson[PutDashboardInfo](getHeader(200, session), dashboards))
            case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    }
  }

  @ApiOperation(value = "Add new dashboards to the system", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "dashboards", value = "Dashboard objects to be added", required = true, dataType = "edp.davinci.rest.PostDashboardInfoSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "dashboard is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def postDashboardRoute: Route = path(routeName) {
    post {
      entity(as[PostDashboardInfoSeq]) {
        dashboardSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => postDashBoard(session, dashboardSeq.payload)
          }
      }
    }
  }

  def postDashBoard(session: SessionClass, postDashboardSeq: Seq[PostDashboardInfo]): Route = {
    if (session.admin) {
      val dashboardSeq = postDashboardSeq.map(post => Dashboard(0, post.name, Some(post.pic), post.desc, post.publish, active = true, currentTime, session.userId, currentTime, session.userId))
      onComplete(modules.dashboardDal.insert(dashboardSeq)) {
        case Success(dashWithIdSeq) =>
          val responseDashSeq = dashWithIdSeq.map(dashboard => PutDashboardInfo(dashboard.id, dashboard.name, dashboard.pic.getOrElse(""), dashboard.desc, dashboard.publish, Some(dashboard.active)))
          complete(OK, ResponseSeqJson[PutDashboardInfo](getHeader(200, session), responseDashSeq))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @ApiOperation(value = "update dashboards in the system", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "dashboard", value = "Dashboard objects to be updated", required = true, dataType = "edp.davinci.rest.PutDashboardSeq", paramType = "body")
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
            session => putDashboardComplete(session, dashboardSeq.payload)
          }
      }
    }
  }

  def putDashboardComplete(session: SessionClass, dashboardSeq: Seq[PutDashboardInfo]): Route = {
    if (session.admin) {
      onComplete(update(session, dashboardSeq)) {
        case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
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
  def deleteDashboardByIdRoute: Route = path(routeName / LongNumber) { dashboardId =>
    delete {
      authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            val operation = for {
              delDashboard <- deleteDashboard(dashboardId)
              delRel <- deleteRelByFilter(dashboardId)
            } yield (delDashboard, delRel)
            onComplete(operation) {
              case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
      }
    }
  }

  @Path("/widgets")
  @ApiOperation(value = "add widgets to a dashboard", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "relDashboardWidget", value = "RelDashboardWidget objects to be added", required = true, dataType = "edp.davinci.rest.PostRelDashboardWidgetSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def postWidget2DashboardRoute: Route = path(routeName / "widgets") {
    post {
      entity(as[PostRelDashboardWidgetSeq]) {
        relDashboardWidgetSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => postWidget2Dashboard(session, relDashboardWidgetSeq.payload)
          }
      }
    }
  }

  def postWidget2Dashboard(session: SessionClass, postRelDWSeq: Seq[PostRelDashboardWidget]): Route = {
    if (session.admin) {
      val relDWSeq = postRelDWSeq.map(post => RelDashboardWidget(0, post.dashboard_id, post.widget_id, post.position_x, post.position_y, post.length, post.width, post.trigger_type, post.trigger_params, active = true, currentTime, session.userId, currentTime, session.userId))
      onComplete(modules.relDashboardWidgetDal.insert(relDWSeq)) {
        case Success(relDWWithIdSeq) =>
          val responseRelDWSeq = relDWWithIdSeq.map(rel => PutRelDashboardWidget(rel.id, rel.dashboard_id, rel.widget_id, rel.position_x, rel.position_y, rel.length, rel.width, rel.trigger_type, rel.trigger_params))
          complete(OK, ResponseSeqJson[PutRelDashboardWidget](getHeader(200, session), responseRelDWSeq))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @Path("/widgets")
  @ApiOperation(value = "update widgets in the dashboard", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "relDashboardWidget", value = "RelDashboardWidget objects to be added", required = true, dataType = "edp.davinci.rest.PutRelDashboardWidgetSeq", paramType = "body")
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
        relDashboardWidgetSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => updateWidgetInDashboard(session, relDashboardWidgetSeq.payload)
          }
      }
    }
  }

  def updateWidgetInDashboard(session: SessionClass, relSeq: Seq[PutRelDashboardWidget]): Route = {
    if (session.admin) {
      onComplete(updateRelDashboardWidget(session, relSeq)) {
        case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
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
  def deleteWidgetFromDashboardRoute: Route = path(routeName / "widgets" / LongNumber) { relId =>
    delete {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            onComplete(deleteRelDWById(relId)) {
              case Success(r) => complete(OK, ResponseJson[Int](getHeader(200, session), r))
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          }
          else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
      }
    }
  }


}
