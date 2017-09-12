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

package edp.davinci.rest.download

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes.BadRequest
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.module.{BusinessModule, ConfigurationModule, PersistenceModule, RoutesModuleImpl}
import edp.davinci.rest.view.ViewService
import edp.davinci.rest.widget.WidgetService
import edp.davinci.rest.{ResponseJson, RouteHelper, SessionClass}
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.ResponseUtils.getHeader
import edp.davinci.util.{AuthorizationProvider, SqlUtils}
import io.swagger.annotations._
import scala.util.{Failure, Success}

@Api(value = "/downloads", consumes = "application/json", produces = "application/json")
@Path("/downloads")
class DownloadRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives with SqlUtils {
  private lazy val routeName = "downloads"
  private lazy val textCSV = MediaTypes.`text/csv` withCharset HttpCharsets.`UTF-8`
  val routes: Route = downloadCSVRoute

  @Path("/csv/{widget_id}")
  @ApiOperation(value = "download csv", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "widget_id", value = "the entity id to download", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 404, message = "widget not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def downloadCSVRoute: Route = path(routeName / "csv" / LongNumber) { widgetId =>
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(WidgetService.getFlatTableId(widgetId)) {
            case Success(widgetInfo) =>
              val sourceFuture = ViewService.getSourceInfo(widgetInfo._1, session)
              RouteHelper.getResultBySource(sourceFuture,textCSV,null,null,null,null)
            case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
          }
      }
    }
  }

}
