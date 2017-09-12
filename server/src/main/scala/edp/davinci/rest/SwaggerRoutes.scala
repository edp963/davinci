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

package edp.davinci.rest

import akka.actor.ActorSystem
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer
import com.github.swagger.akka.{HasActorSystem, SwaggerHttpService}
import edp.davinci.DavinciStarter
import edp.davinci.rest.dashboard.DashboardRoutes
import edp.davinci.rest.download.DownloadRoutes
import edp.davinci.rest.group.GroupRoutes
import edp.davinci.rest.shares.ShareRoutes
import edp.davinci.rest.source.SourceRoutes
import edp.davinci.rest.sqllog.SqlLogRoutes
import edp.davinci.rest.user.UserRoutes
import edp.davinci.rest.view.ViewRoutes
import edp.davinci.rest.widget.WidgetRoutes

import scala.reflect.runtime.universe._

class SwaggerRoutes extends SwaggerHttpService with HasActorSystem {
  override implicit val actorSystem: ActorSystem = DavinciStarter.system
  override implicit val materializer: ActorMaterializer = DavinciStarter.materializer
  override val apiTypes = Seq(
    typeOf[LoginRoutes],
    typeOf[UserRoutes],
    typeOf[ChangePwdRoutes],
    typeOf[ViewRoutes],
    typeOf[DashboardRoutes],
    typeOf[WidgetRoutes],
    typeOf[SourceRoutes],
    typeOf[GroupRoutes],
    typeOf[SqlLogRoutes],
    typeOf[ShareRoutes],
    typeOf[DownloadRoutes]
  )

  override val host: String = DavinciStarter.host + ":" + DavinciStarter.port
  //the url of your api, not swagger's json endpoint
  override val basePath = "/api/v1"
  //the basePath for the API you are exposing
  override val apiDocsPath = "api-docs"
  //where you want the swagger-json endpoint exposed
  //  override val info = Info("Davinci REST API")
  //  provides license and other description details
  val dir: String = System.getenv("DAVINCI_HOME")
  val indexRoute: Route = get {
    pathPrefix("swagger") {
      pathEndOrSingleSlash {
        getFromFile(s"$dir/swagger-ui/index.html")
      }
    } ~ getFromDirectory(s"$dir/swagger-ui")
  }
}
