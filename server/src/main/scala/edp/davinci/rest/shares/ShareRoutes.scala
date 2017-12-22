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





package edp.davinci.rest.shares

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.model.{HttpEntity, _}
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.util.DavinciConstants.{conditionSeparator, _}
import edp.davinci.module.{BusinessModule, ConfigurationModule, PersistenceModule, RoutesModuleImpl}
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import edp.davinci.rest.dashboard.DashboardService
import edp.davinci.rest.shares.ShareRouteHelper.{getShareInfo, isValidShareInfo, mergeInfo, _}
import edp.davinci.rest.user.UserService
import edp.davinci.rest.view.ViewService
import edp.davinci.rest.widget.WidgetService
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.ResponseUtils.getHeader
import edp.davinci.util._
import io.swagger.annotations._
import org.apache.log4j.Logger
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class ShareInfo(userId: Long, infoId: Long, authName: String, md5: String)

case class ShareAuthInfo(userId: Long, infoId: Long, authName: String)

@Api(value = "/shares", consumes = "application/json", produces = "application/json")
@Path("/shares")
class ShareRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives with SqlUtils {
  val routes: Route = getWidgetURLRoute ~ getDashboardURLRoute ~ getHtmlRoute ~ getCSVRoute ~ getShareDashboardRoute ~ getShareWidgetRoute ~ getShareResultRoute ~ loginAndVerifyRoute
  private lazy val routeName = "shares"
  private lazy val logger = Logger.getLogger(this.getClass)


  @Path("/widget/{widget_id}")
  @ApiOperation(value = "get the share widget url", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "widget_id", value = "the entity id to share", required = true, dataType = "integer", paramType = "path"),
    new ApiImplicitParam(name = "auth_name", value = "the authorized user name", required = false, dataType = "string", paramType = "query")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 404, message = "widget not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getWidgetURLRoute: Route = path(routeName / "widget" / LongNumber) { widgetId =>
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          parameter('auth_name.as[String].?) { authName =>
            val aesStr = getShareURL(session.userId, widgetId, authName.getOrElse(""))
            complete(OK, ResponseJson[String](getHeader(200, "url token", null), aesStr))
          }
      }
    }
  }


  @Path("/dashboard/{dashboard_id}")
  @ApiOperation(value = "get the html share url", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "dashboard_id", value = "the entity id to share", required = true, dataType = "integer", paramType = "path"),
    new ApiImplicitParam(name = "auth_name", value = "the authorized user name", required = false, dataType = "string", paramType = "query")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 404, message = "widget not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getDashboardURLRoute: Route = path(routeName / "dashboard" / LongNumber) { dashboardId =>
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          parameter('auth_name.as[String].?) { authName =>
            val aesStr = getShareURL(session.userId, dashboardId, authName.getOrElse(""))
            complete(OK, ResponseJson[String](getHeader(200, "url token", null), aesStr))
          }
      }
    }
  }


  @Path("/html/{share_info}")
  @ApiOperation(value = "get html by share info", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "share_info", value = "share info value", required = true, dataType = "string", paramType = "path"),
    new ApiImplicitParam(name = "offset", value = "offset", required = false, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "limit", value = "limit", required = false, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "sortby", value = "sortby", required = false, dataType = "string", paramType = "query"),
    new ApiImplicitParam(name = "usecache", value = "true or false", required = false, dataType = "boolean", paramType = "query"),
    new ApiImplicitParam(name = "expired", value = "seconds", required = false, dataType = "integer", paramType = "query")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getHtmlRoute: Route = path(routeName / "html" / Segment) { shareInfoStr =>
    get {
      parameters('offset.as[Int] ? -1, 'limit.as[Int] ? -1, 'sortby.as[String] ? "", 'usecache.as[Boolean] ? true, 'expired.as[Int] ? 300) {
        (offset, limit, sortBy, useCache, expired) =>
          authVerify(shareInfoStr, textHtml, null, PageInfo(limit, offset, sortBy), CacheInfo(useCache, expired))
      }
    }
  }


  @Path("/csv/{share_info}")
  @ApiOperation(value = "get csv by share info", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "share_info", value = "share info value", required = true, dataType = "string", paramType = "path"),
    new ApiImplicitParam(name = "manualInfo", value = "manualInfo", required = false, dataType = "edp.davinci.rest.ManualInfo", paramType = "body"),
    new ApiImplicitParam(name = "offset", value = "offset", required = false, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "limit", value = "limit", required = false, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "sortby", value = "sortby", required = false, dataType = "string", paramType = "query"),
    new ApiImplicitParam(name = "usecache", value = "true or false", required = false, dataType = "boolean", paramType = "query"),
    new ApiImplicitParam(name = "expired", value = "seconds", required = false, dataType = "integer", paramType = "query")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getCSVRoute: Route = path(routeName / "csv" / Segment) { shareInfoStr =>
    post {
      entity(as[Option[ManualInfo]]) { manualInfo =>
        parameters('offset.as[Int] ? -1, 'limit.as[Int] ? -1, 'sortby.as[String] ? "", 'usecache.as[Boolean] ? true, 'expired.as[Int] ? 300) {
          (offset, limit, sortBy, useCache, expired) =>
            authVerify(shareInfoStr, textCSV, manualInfo.orNull, PageInfo(limit, offset, sortBy), CacheInfo(useCache, expired))
        }
      }
    }
  }


  @Path("/widget/{share_info}")
  @ApiOperation(value = "get widget by share info", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "share_info", value = "share info value", required = true, dataType = "string", paramType = "path")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getShareWidgetRoute: Route = path(routeName / "widget" / Segment) { shareInfoStr =>
    get {
      val shareInfo = getShareInfo(shareInfoStr)
      val authName = shareInfo.authName

      def getWidgetInfo = {
        if (isValidShareInfo(shareInfo)) {
          onComplete(WidgetService.getWidgetById(shareInfo.infoId)) {
            case Success(widgetOpt) => widgetOpt match {
              case Some(widget) => complete(OK, ResponseJson[Seq[PutWidgetInfo]](getHeader(200, null), Seq(widget)))
              case None => complete(BadRequest, ResponseJson[String](getHeader(400, s"not found widget: ${shareInfo.infoId}", null), ""))
            }
            case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
          }
        }
        else complete(BadRequest, ResponseJson[String](getHeader(400, "bad request", null), "widget info verify failed"))
      }

      if (authName != "") {
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
          session =>
            onComplete(UserService.getUserInfo(session.userId)) {
              case Success(user) =>
                if (authName == user._2) getWidgetInfo
                else complete(BadRequest, ResponseJson[String](getHeader(400, "Not the authorized user,login and try again!!!", null), ""))
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
        }
      } else getWidgetInfo
    }
  }


  @Path("/dashboard/{share_info}")
  @ApiOperation(value = "get shared dashboard by share info", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "share_info", value = "share info value", required = true, dataType = "string", paramType = "path")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getShareDashboardRoute: Route = path(routeName / "dashboard" / Segment) { shareInfoStr =>
    get {
      val shareInfo = getShareInfo(shareInfoStr)
      val authName = shareInfo.authName

      def getDashboardInfo = {
        if (isValidShareInfo(shareInfo)) {
          val infoArr = shareInfoStr.split(conditionSeparator.toString)
          if (infoArr.length > 1)
            getDashboardComplete(shareInfo, infoArr(1))
          else getDashboardComplete(shareInfo)
        }
        else complete(BadRequest, ResponseJson[String](getHeader(400, "bad request", null), "dashboard info verify failed"))

      }

      if (authName != "") {
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
          session =>
            onComplete(UserService.getUserInfo(session.userId)) {
              case Success(user) =>
                if (authName == user._2) getDashboardInfo
                else complete(BadRequest, ResponseJson[String](getHeader(400, "Not the authorized user,login and try again!!!", null), ""))
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
        }
      } else getDashboardInfo
    }
  }


  private def getDashboardComplete(shareInfo: ShareInfo, urlOperation: String = null): Route = {
    val operation = for {
      group <- UserService.getUserGroup(shareInfo.userId)
      user <- UserService.getUserInfo(shareInfo.userId)
    } yield (group, user)
    onComplete(operation) {
      case Success(userGroup) =>
        val (groupIds, admin) = userGroup
        val dashboardInfo = for {
          dashboard <- DashboardService.getDashBoard(shareInfo.infoId)
          widgetInfo <- DashboardService.getRelInfo(SessionClass(shareInfo.userId, groupIds.toList, admin._1), shareInfo.infoId)
        } yield (dashboard, widgetInfo)
        onComplete(dashboardInfo) {
          case Success(shareDashboard) =>
            val (dashboard, widgets) = (shareDashboard._1.orNull, shareDashboard._2)
            val infoSeq = widgets.map(r => {
              val aesStr = getShareURL(shareInfo.userId, r.widget_id, shareInfo.authName)
              val shareAES = if (null != urlOperation) s"$aesStr$conditionSeparator$urlOperation" else aesStr
              WidgetInfo(r.id, r.widget_id, r.flatTableId, r.position_x, r.position_y, r.width, r.length, r.trigger_type, r.trigger_params, shareAES, r.create_by)
            })
            if (null == dashboard) complete(BadRequest, ResponseJson[String](getHeader(400, "dashboard not exists", null), ""))
            else {
              val dashboardInfo = DashboardInfo(dashboard.id, dashboard.name, dashboard.pic.getOrElse(""), dashboard.desc, dashboard.linkage_detail.getOrElse(""), dashboard.publish, dashboard.create_by, infoSeq)
              complete(OK, ResponseJson[DashboardInfo](getHeader(200, null), dashboardInfo))
            }
          case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
        }
      case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
    }
  }


  @Path("/resultset/{share_info}")
  @ApiOperation(value = "get shared result by share info", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "share_info", value = "share info value", required = true, dataType = "string", paramType = "path"),
    new ApiImplicitParam(name = "manualInfo", value = "manualInfo", required = false, dataType = "edp.davinci.rest.ManualInfo", paramType = "body"),
    new ApiImplicitParam(name = "offset", value = "offset", required = false, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "limit", value = "limit", required = false, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "sortby", value = "sortby", required = false, dataType = "string", paramType = "query"),
    new ApiImplicitParam(name = "usecache", value = "true or false", required = false, dataType = "boolean", paramType = "query"),
    new ApiImplicitParam(name = "expired", value = "seconds", required = false, dataType = "integer", paramType = "query")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getShareResultRoute: Route = path(routeName / "resultset" / Segment) { shareInfoStr =>
    post {
      entity(as[Option[ManualInfo]]) { manualInfo =>
        parameters('offset.as[Int] ? -1, 'limit.as[Int] ? -1, 'sortby.as[String] ? "", 'usecache.as[Boolean] ? true, 'expired.as[Int] ? 300) {
          (offset, limit, sortBy, useCache, expired) =>
            authVerify(shareInfoStr, appJson, manualInfo.orNull, PageInfo(limit, offset, sortBy), CacheInfo(useCache, expired))
        }
      }
    }
  }

  private def authVerify(shareInfoStr: String,
                         contentType: ContentType.NonBinary,
                         manualInfo: ManualInfo = null,
                         pageInfo: PageInfo,
                         cacheInfo: CacheInfo): Route = {
    def verifyAndGetResult: Route = {
      val infoArr: Array[String] = shareInfoStr.split(conditionSeparator.toString)
      try {
        val shareInfo = getShareInfo(shareInfoStr)
        if (isValidShareInfo(shareInfo)) {
          if (infoArr.length == 2)
            getResultComplete(shareInfo, contentType, mergeInfo(infoArr, manualInfo), pageInfo, cacheInfo)
          else getResultComplete(shareInfo, contentType, manualInfo, pageInfo, cacheInfo)
        } else complete(HttpEntity(contentType, "".getBytes("UTF-8")))
      } catch {
        case ex: Throwable => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
      }
    }

    val shareInfo = getShareInfo(shareInfoStr)
    val authName = shareInfo.authName
    if (authName != "") {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(UserService.getUserInfo(session.userId)) {
            case Success(user) =>
              if (authName == user._2) verifyAndGetResult
              else complete(BadRequest, ResponseJson[String](getHeader(400, "Not the authorized user,login and try again", null), ""))
            case Failure(ex) =>
              logger.error(s"user not found ", ex)
              complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    } else verifyAndGetResult
  }

  private def getResultComplete(shareInfo: ShareInfo,
                                contentType: ContentType.NonBinary,
                                manualInfo: ManualInfo,
                                pageInfo: PageInfo,
                                cacheInfo: CacheInfo
                               ): Route = {
    val operation = for {
      widget <- WidgetService.getWidgetById(shareInfo.infoId)
      group <- UserService.getUserGroup(shareInfo.userId)
      user <- UserService.getUserInfo(shareInfo.userId)
    } yield (widget, group, user)
    onComplete(operation) {
      case Success(widgetAndGroup) =>
        val (widgetOpt, groupIds, admin) = widgetAndGroup
        widgetOpt match {
          case Some(widget) => val sourceFuture = ViewService.getSourceInfo(widget.flatTable_id, SessionClass(shareInfo.userId, groupIds.toList, admin._1))
            logger.info("in widget option " + s"userid ${shareInfo.userId} infoid ${shareInfo.infoId}")
            RouteHelper.getResultComplete(sourceFuture, contentType, manualInfo, pageInfo, cacheInfo)
          case None =>
            logger.warn(s"widget not found: ${shareInfo.infoId} ,user id ${shareInfo.userId}")
            complete(BadRequest, ResponseJson[String](getHeader(404, s"not found: ${shareInfo.infoId} user id ${shareInfo.userId}", null), ""))
        }
      case Failure(ex) =>
        logger.error(s"bad request exception ", ex)
        complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
    }
  }


  @Path("/login/{share_info}")
  @ApiOperation(value = "get shared result by share info", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "share_info", value = "share info value", required = true, dataType = "string", paramType = "path"),
    new ApiImplicitParam(name = "username", value = "Login information", required = true, dataType = "edp.davinci.persistence.entities.LoginClass", paramType = "body")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def loginAndVerifyRoute: Route = path(routeName / "login" / Segment) { shareInfoStr =>
    post {
      entity(as[LoginClass]) { login =>
        lazy val ldapIsEnable = modules.config.getBoolean("ldap.isEnable")
        onComplete(AuthorizationProvider.createSessionClass(login, ldapIsEnable)) {
          case Success(sessionEither) =>
            sessionEither.fold(
              authorizationError => complete(BadRequest, ResponseJson[String](getHeader(authorizationError.statusCode, authorizationError.desc, null), "user name or password invalid")),
              info => {
                val email = info._2.email
                val authName = getShareInfo(shareInfoStr).authName
                if (authName != email)
                  complete(BadRequest, ResponseJson[String](getHeader(400, "Not the authorized user,login and try again", null), "Not the authorized user,login and try again"))
                else complete(OK, ResponseJson[QueryUserInfo](getHeader(200, info._1), info._2))
              }
            )
          case Failure(ex) => complete(Unauthorized, ResponseJson[String](getHeader(401, ex.getMessage, null), ""))
        }
      }
    }
  }

}


