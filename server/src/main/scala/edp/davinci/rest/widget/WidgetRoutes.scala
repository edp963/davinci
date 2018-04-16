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


package edp.davinci.rest.widget

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.module.{BusinessModule, ConfigurationModule, PersistenceModule, RoutesModuleImpl}
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import edp.davinci.util.json.JsonProtocol._
import edp.davinci.util.common.ResponseUtils._
import edp.davinci.util.common.DavinciConstants.requestTimeout
import edp.davinci.util.common.AuthorizationProvider
import io.swagger.annotations._
import org.apache.log4j.Logger

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.{FiniteDuration, SECONDS}
import scala.util.{Failure, Success}

@Api(value = "/widgets", consumes = "application/json", produces = "application/json")
@Path("/widgets")
class WidgetRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {
  val routes: Route = getWidgetsRoute ~ postWidgetRoute ~ deleteWidgetByIdRoute ~ putWidgetRoute ~ getWholeSqlByWidgetIdRoute
  private lazy val logger = Logger.getLogger(this.getClass)
  private lazy val routeName = "widgets"

  @ApiOperation(value = "list all widgets", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "active", value = "true or false", required = false, dataType = "boolean", paramType = "query")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "widgets not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getWidgetsRoute: Route = path(routeName) {
    get {
      parameter('active.as[Boolean].?) { active =>
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
          session => getWidgetsComplete(session, active.getOrElse(true))
        }
      }
    }
  }

  private def getWidgetsComplete(session: SessionClass, active: Boolean): Route = {
    onComplete(WidgetService.getAll(session)) {
      case Success(widgetSeq) =>
        complete(OK, ResponseJson[Seq[PutWidget]](getHeader(200, session), widgetSeq))
      case Failure(ex) => logger.error("getAllWidgetsComplete error", ex)
        complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
    }
  }

  @ApiOperation(value = "Add a new widget to the system", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "widget", value = "Widget object to be added", required = true, dataType = "edp.davinci.persistence.entities.PostWidgetSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "widgets not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def postWidgetRoute: Route = path(routeName) {
    post {
      entity(as[PostWidgetSeq]) {
        widgetSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => createWidgets(session, widgetSeq.payload)
          }
      }
    }
  }

  private def createWidgets(session: SessionClass, postWidgetSeq: Seq[PostWidget]): Route = {
    if (session.admin) {
      val widgetSeq = postWidgetSeq.map(post => Widget(0, post.widgetlib_id, post.flatTable_id, post.name, post.adhoc_sql, post.desc, post.config, post.chart_params, post.query_params, post.publish, active = true, currentTime, session.userId, currentTime, session.userId))
      onComplete(modules.widgetDal.insert(widgetSeq)) {
        case Success(widgets) =>
          val putWidgets = widgets.map(w => PutWidget(w.id, w.widgetlib_id, w.flatTable_id, w.name, w.adhoc_sql, w.desc, w.config, w.chart_params, w.query_params, w.publish, w.create_by))
          complete(OK, ResponseSeqJson[PutWidget](getHeader(200, session), putWidgets))
        case Failure(ex) => logger.error("postWidgetComplete error", ex)
          complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @ApiOperation(value = "update widgets in the system", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "widget", value = "Widget object to be updated", required = true, dataType = "edp.davinci.persistence.entities.PutWidgetSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "put success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "widgets not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def putWidgetRoute: Route = path(routeName) {
    put {
      entity(as[PutWidgetSeq]) {
        widgetSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => updateWidgets(session, widgetSeq.payload)
          }
      }
    }
  }

  private def updateWidgets(session: SessionClass, putWidgetSeq: Seq[PutWidget]): Route = {
    if (session.admin) {
      val widget = Await.result(modules.widgetDal.findById(putWidgetSeq.head.id), new FiniteDuration(requestTimeout, SECONDS))
      if (widget.nonEmpty) {
        if (session.userId == widget.get.create_by)
          onComplete(WidgetService.update(putWidgetSeq, session)) {
            case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
            case Failure(ex) => logger.error("putWidgetComplete error", ex)
              complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          } else complete(BadRequest, ResponseJson[String](getHeader(400, "permission denied,con not update the widget created by others", session), ""))
      } else complete(BadRequest, ResponseJson[String](getHeader(400, "widget can not found", session), ""))
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }

  @Path("/{widget_id}")
  @ApiOperation(value = "delete widget by id", notes = "", nickname = "", httpMethod = "DELETE")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "widget_id", value = "widget id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "delete success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def deleteWidgetByIdRoute: Route = path(routeName / LongNumber) { widgetId =>
    delete {
      authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            val create_by = Await.result(modules.widgetDal.findById(widgetId), new FiniteDuration(requestTimeout, SECONDS)).get.create_by
            if (create_by == session.userId)
              onComplete(WidgetService.deleteWidget(widgetId, session)) {
                case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
                case Failure(ex) => logger.error("deleteWidgetByIdRoute error", ex)
                  complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
              } else complete(BadRequest, ResponseJson[String](getHeader(400, "permission denied con not delete the widget created by others", session), ""))
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
      }
    }
  }

  @Path("/{widget_id}/sqls")
  @ApiOperation(value = "get whole sql by widget id", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "widget_id", value = "widget id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getWholeSqlByWidgetIdRoute: Route = path(routeName / LongNumber / "sqls") { widgetId =>
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(WidgetService.getSql(widgetId)) {
            case Success(sqlSeq) =>
              val (adHocSql, sqlTemplate, _) = sqlSeq.head
              val resultSql = Array(sqlTemplate, adHocSql)
              complete(OK, ResponseJson[SQL](getHeader(200, session), SQL(resultSql)))
            case Failure(ex) => logger.error("getWholeSqlComplete error", ex)
              complete(InternalServerError, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    }

  }

}
