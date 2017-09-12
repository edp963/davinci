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

package edp.davinci.util

import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.server.Directive0
import akka.http.scaladsl.server.directives.RespondWithDirectives._
import edp.davinci.util.DateUtils.yyyyMMddHHmmssToString
import edp.davinci.rest.{ResponseHeader, SessionClass}
import edp.davinci.util.JwtSupport._

object ResponseUtils {

  def responseHeaderWithToken(session: SessionClass): Directive0 = {
    respondWithHeader(RawHeader("token", JwtSupport.generateToken(session)))
  }

  def currentTime: String = yyyyMMddHHmmssToString(DateUtils.currentyyyyMMddHHmmss, DtFormat.TS_DASH_SEC)

  val msgmap = Map(200 -> "Success", 404 -> "Not found", 401 -> "Unauthorized", 403 -> "User not admin", 500 -> "Internal server error")

  def getHeader(code: Int, session: SessionClass): ResponseHeader = {
    if (session != null)
      ResponseHeader(code, msgmap(code), generateToken(session))
    else
      ResponseHeader(code, msgmap(code))
  }

  def getHeader(code: Int, msg: String, session: SessionClass): ResponseHeader = {
    if (session != null)
      ResponseHeader(code, msg, generateToken(session))
    else
      ResponseHeader(code, msg)
  }
}
