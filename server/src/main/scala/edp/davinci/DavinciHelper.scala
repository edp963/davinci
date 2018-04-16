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





package edp.davinci

import akka.http.scaladsl.model.HttpProtocols.`HTTP/1.0`
import akka.http.scaladsl.model._


case class ParamHelper(f: Option[String] = None, p: Option[List[KV]] = None) {
  lazy val f_get: String = f.orNull
  lazy val p_get: List[KV] = p.orNull
}

case class KV(k: String, v: String)

case class RequestHelper(method: HttpMethod,
                         uri: Uri,
                         headers: Seq[HttpHeader],
                         entity: RequestEntity,
                         protocol: HttpProtocol)


case class HttpRequestHepler(method: Option[String] = Some("GET"),
                             uri: String,
                             headers: Option[Seq[KV]] = None,
                             entity: Option[String] = None,
                             protocol: HttpProtocol = `HTTP/1.0`) {
  lazy val method_get: HttpMethod = method.get.toUpperCase match {
    case "GET" => HttpMethods.GET
    case "PUT" => HttpMethods.PUT
    case "DELETE" => HttpMethods.DELETE
    case "POST" => HttpMethods.POST
  }

  lazy val headers_get: Seq[KV] = headers.get
  lazy val entity_get: String = entity.get

}
