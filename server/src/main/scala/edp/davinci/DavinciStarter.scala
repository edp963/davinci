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





package edp.davinci

import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import edp.davinci.rest._

object DavinciStarter extends App {
  // configuring modules for application, cake pattern for DI
  val modules = ModuleInstance.getModule

  implicit lazy val system = modules.system
  implicit lazy val materializer = ActorMaterializer()
  implicit lazy val ec = modules.system.dispatcher

  lazy val host = modules.config.getString("httpServer.host")
  lazy val port = modules.config.getInt("httpServer.port")
  Http().bindAndHandle(new RoutesApi(modules).routes, host, port)
}
