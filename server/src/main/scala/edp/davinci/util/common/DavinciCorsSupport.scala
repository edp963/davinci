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





package edp.davinci.util.common

import akka.http.scaladsl.marshalling.ToResponseMarshallable.apply
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.HttpResponse
import akka.http.scaladsl.model.StatusCode.int2StatusCode
import akka.http.scaladsl.model.headers._
import akka.http.scaladsl.server.Directive.addByNameNullaryApply
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{Directive0, Route}

//see https://groups.google.com/forum/#!topic/akka-user/5RCZIJt7jHo
trait DavinciCorsSupport {

  private val addHeaders: Directive0 = mapResponseHeaders { headers =>
    `Access-Control-Allow-Origin`.* +:
      `Access-Control-Allow-Credentials`(true) +:
      `Access-Control-Allow-Headers`("Authorization", "Content-Type", "X-Requested-With") +:
      headers
  }

  private def preflightRequestHandler: Route = options {
    complete(HttpResponse(200).withHeaders(
      `Access-Control-Allow-Methods`(OPTIONS, POST, PUT, GET, DELETE)))
  }

  def crossHandler(r: Route): Route = addHeaders {
    preflightRequestHandler ~ r
  }
}
