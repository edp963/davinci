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

import java.net.URLDecoder
import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.model.{HttpEntity, _}
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.DavinciConstants.{conditionSeparator, defaultEncode}
import edp.davinci.module.{BusinessModule, ConfigurationModule, PersistenceModule, RoutesModuleImpl}
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import edp.davinci.rest.dashboard.DashboardService
import edp.davinci.rest.user.UserService
import edp.davinci.rest.view.ViewService
import edp.davinci.rest.widget.WidgetService
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.JsonUtils.{caseClass2json, json2caseClass}
import edp.davinci.util.ResponseUtils.getHeader
import edp.davinci.util.{AesUtils, AuthorizationProvider, MD5Utils, SqlUtils}
import edp.davinci.{KV, ParamHelper}
import io.swagger.annotations._
import org.apache.log4j.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class ShareInfo(userId: Long, infoId: Long, authName: String, md5: String)

case class ShareAuthInfo(userId: Long, infoId: Long, authName: String)

@Api(value = "/shares", consumes = "application/json", produces = "application/json")
@Path("/shares")
class ShareRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives with SqlUtils {
  val routes: Route = getWidgetURLRoute ~ getDashboardURLRoute ~ getHtmlRoute ~ getCSVRoute ~ getShareDashboardRoute ~ getShareWidgetRoute ~ getShareResultRoute
  private val logger = Logger.getLogger(this.getClass)
  private lazy val routeName = "shares"
  private lazy val aesPassword = modules.config.getString("aes.secret")
  private lazy val textHtml = MediaTypes.`text/html` withCharset HttpCharsets.`UTF-8`
  private lazy val textCSV = MediaTypes.`text/csv` withCharset HttpCharsets.`UTF-8`
  private lazy val appJson = ContentTypes.`application/json`

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


  private def getShareURL(userId: Long, infoId: Long, authorizedName: String): String = {
    val shareAuthInfo = caseClass2json[ShareAuthInfo](ShareAuthInfo(userId, infoId, authorizedName))
    val MD5Info = MD5Utils.getMD5(shareAuthInfo)
    val shareQueryInfo = ShareInfo(userId, infoId, authorizedName, MD5Info)
    AesUtils.encrypt(caseClass2json(shareQueryInfo), aesPassword)
  }


  @Path("/html/{share_info}")
  @ApiOperation(value = "get html by share info", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "share_info", value = "share info value", required = true, dataType = "string", paramType = "path"),
    new ApiImplicitParam(name = "limit", value = "limit", required = false, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "offset", value = "offset", required = false, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "sortby", value = "sortby", required = false, dataType = "string", paramType = "query")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getHtmlRoute: Route = path(routeName / "html" / Segment) { shareInfoStr =>
    get {
      parameters('offset.as[Int] ? 0, 'limit.as[Int] ? -1, 'sortby.as[String] ? "") { (offset, limit, sortby) =>
        val paginationInfo = if (limit != -1) s" limit $limit offset $offset" else ""
        val sortInfo = if (sortby != "") "ORDER BY " + sortby.map(ch => if (ch == ':') ' ' else ch) else ""
        val paginateAndSort = sortInfo + paginationInfo
        authVerify(shareInfoStr, textHtml, paginateAndSort)
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
    new ApiImplicitParam(name = "sortby", value = "sort by", required = false, dataType = "string", paramType = "query")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getCSVRoute: Route = path(routeName / "csv" / Segment) { shareInfoStr =>
    post {
      entity(as[ManualInfo]) { manualInfo =>
        parameters('offset.as[Int] ? 0, 'limit.as[Int] ? -1, 'sortby.as[String] ? "") { (offset, limit, sortby) =>
          val paginationInfo = if (limit != -1) s" limit $limit offset $offset" else ""
          val sortInfo = if (sortby != "") "ORDER BY " + sortby.map(ch => if (ch == ':') ' ' else ch) else ""
          val paginateAndSort = sortInfo + paginationInfo
          authVerify(shareInfoStr, textCSV, paginateAndSort, manualInfo)
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
            case Success(widget) =>
              val putWidgetInfo = PutWidgetInfo(widget._1, widget._2, widget._3, widget._4, widget._5.getOrElse(""), widget._6, widget._7, widget._8, widget._9, Some(widget._10))
              complete(OK, ResponseJson[Seq[PutWidgetInfo]](getHeader(200, null), Seq(putWidgetInfo)))
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
                else complete(BadRequest, ResponseJson[String](getHeader(400, "bad request", null), "Not the authorized user,login and verify again!!!"))
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
            getDashboardComplete(shareInfo.userId, shareInfo.infoId, shareInfo.authName, infoArr(1))
          else getDashboardComplete(shareInfo.userId, shareInfo.infoId, shareInfo.authName)
        }
        else complete(BadRequest, ResponseJson[String](getHeader(400, "bad request", null), "dashboard info verify failed"))

      }

      if (authName != "") {
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
          session =>
            onComplete(UserService.getUserInfo(session.userId)) {
              case Success(user) =>
                if (authName == user._2) getDashboardInfo
                else complete(BadRequest, ResponseJson[String](getHeader(400, "bad request", null), "Not the authorized user,login and verify again!!!"))
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
        }
      } else getDashboardInfo
    }
  }


  private def getDashboardComplete(userId: Long, infoId: Long, authName: String, urlOperation: String = null): Route = {
    val operation = for {
      group <- UserService.getUserGroup(userId)
      user <- UserService.getUserInfo(userId)
    } yield (group, user)
    onComplete(operation) {
      case Success(userGroup) =>
        val (groupIds, admin) = userGroup
        val dashboardInfo = for {
          dashboard <- DashboardService.getDashBoard(infoId)
          widgetInfo <- DashboardService.getDashboardInsideInfo(infoId, groupIds, admin._1)
        } yield (dashboard, widgetInfo)
        onComplete(dashboardInfo) {
          case Success(shareDashboard) =>
            val (dashboard, widgets) = (shareDashboard._1.orNull, shareDashboard._2)
            val infoSeq = widgets.map(r => {
              val aesStr = getShareURL(userId, r._2, authName)
              val shareInfo = if (null != urlOperation) s"$aesStr$conditionSeparator$urlOperation" else aesStr
              WidgetInfo(r._1, r._2, r._3, r._4, r._5, r._6, r._7, r._8, r._9, shareInfo)
            })
            if (null == dashboard) complete(BadRequest, ResponseJson[String](getHeader(400, "dashboard not exists", null), ""))
            else {
              val dashboardInfo = DashboardInfo(dashboard._1, dashboard._2, dashboard._3.getOrElse(""), dashboard._4, dashboard._5, infoSeq)
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
    new ApiImplicitParam(name = "sortby", value = "sort by", required = false, dataType = "string", paramType = "query")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getShareResultRoute: Route = path(routeName / "resultset" / Segment) { shareInfoStr =>
    post {
      entity(as[ManualInfo]) { manualInfo =>
        parameters('offset.as[Int] ? 0, 'limit.as[Int] ? -1, 'sortby.as[String] ? "") { (offset, limit, sortby) =>
          val paginationInfo = if (limit != -1) s" limit $limit offset $offset" else ""
          val sortInfo = if (sortby != "") "ORDER BY " + sortby.map(ch => if (ch == ':') ' ' else ch) else ""
          val paginateAndSort = sortInfo + paginationInfo
          authVerify(shareInfoStr, appJson, paginateAndSort, manualInfo)
        }
      }
    }
  }

  private def authVerify(shareInfoStr: String, contentType: ContentType.NonBinary, paginateAndSort: String, manualInfo: ManualInfo = null) = {
    def verifyAndGetResult: Route = {
      val infoArr: Array[String] = shareInfoStr.split(conditionSeparator.toString)
      try {
        val shareInfo = getShareInfo(shareInfoStr)
        val (userId, infoId) = (shareInfo.userId, shareInfo.infoId)
        if (isValidShareInfo(shareInfo)) {
          val (manualFilters, widgetParams, adHoc) = if (null == manualInfo) (null, null, null)
          else (manualInfo.manualFilters.orNull, manualInfo.params.orNull, manualInfo.adHoc.orNull)
          if (infoArr.length == 2) {
            val urlDecode = URLDecoder.decode(infoArr.last, defaultEncode)
            logger.info("urlDecode~~~~~~~~~~~~~~~~~~~~~~~~~:" + urlDecode)
            val base64decoder = new sun.misc.BASE64Decoder
            val base64decode: String = new String(base64decoder.decodeBuffer(urlDecode))
            logger.info("base64decode~~~~~~~~~~~~~~~~~~~~~~~~~:" + base64decode)
            val paramAndFilter: ParamHelper = json2caseClass[ParamHelper](base64decode)
            val (urlFilters, urlParams) = (paramAndFilter.f_get, paramAndFilter.p_get)
            logger.info("url filter~~~~~~~~~~~~~~~~~~~~~~~~~:" + urlFilters)
            val filters = mergeFilters(manualFilters, urlFilters)
            val params = mergeParams(widgetParams, urlParams)
            getResultComplete(userId, infoId, contentType, filters, params, paginateAndSort, adHoc)
          } else getResultComplete(userId, infoId, contentType, manualFilters, widgetParams, paginateAndSort, adHoc)
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
              else complete(BadRequest, ResponseJson[String](getHeader(400, "bad request", null), "Not the authorized user,login and verify again!!!"))
            case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    } else verifyAndGetResult
  }


  private def isValidShareInfo(shareInfo: ShareInfo) = {
    if (null == shareInfo) false
    else {
      val MD5Info = MD5Utils.getMD5(caseClass2json(ShareAuthInfo(shareInfo.userId, shareInfo.infoId, shareInfo.authName)))
      if (MD5Info == shareInfo.md5) true else false
    }
  }


  private def getShareInfo(shareInfoStr: String) = {
    val infoArr: Array[String] = shareInfoStr.split(conditionSeparator.toString)
    if (infoArr.head.trim != "") {
      try {
        val jsonShareInfo = AesUtils.decrypt(infoArr.head.trim, aesPassword)
        json2caseClass[ShareInfo](jsonShareInfo)
      } catch {
        case e: Throwable => logger.error("failed to resolve share info", e)
          null.asInstanceOf[ShareInfo]
      }
    }
    else null.asInstanceOf[ShareInfo]
  }


  private def mergeFilters(manualFilters: String, urlFilters: String) = {
    if (null != manualFilters)
      if (null != urlFilters) Set(manualFilters, urlFilters).map(f => s"($f)").mkString(" AND ") else manualFilters
    else urlFilters
  }


  private def mergeParams(widgetParams: List[KV], urlParams: List[KV]) = {
    if (null != widgetParams)
      if (null != urlParams) widgetParams ::: urlParams else widgetParams
    else urlParams
  }

  private def getResultComplete(userId: Long,
                                widgetId: Long,
                                contentType: ContentType.NonBinary,
                                urlFilters: String,
                                paramSeq: Seq[KV],
                                paginateAndSort: String,
                                adHocSql: String = null): Route = {
    val operation = for {
      widget <- WidgetService.getWidgetById(widgetId)
      group <- UserService.getUserGroup(userId)
      user <- UserService.getUserInfo(userId)
    } yield (widget, group, user)
    onComplete(operation) {
      case Success(widgetAndGroup) =>
        val (widget, groupIds, admin) = widgetAndGroup
        val sourceFuture = ViewService.getSqlInfo(widget._3, groupIds, admin._1)
        RouteHelper.getResultBySource(sourceFuture, contentType, urlFilters, paramSeq, paginateAndSort, adHocSql)
      case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
    }
  }

}


