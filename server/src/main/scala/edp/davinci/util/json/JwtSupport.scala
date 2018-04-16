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


package edp.davinci.util.json

import edp.davinci.module.ConfigurationModuleImpl
import edp.davinci.rest.SessionClass
import pdi.jwt.algorithms.JwtHmacAlgorithm
import pdi.jwt.{Jwt, JwtAlgorithm, JwtClaim, JwtHeader}
import edp.davinci.util.json.JsonUtils.caseClass2json

import edp.davinci.util.json.JsonUtils.json2caseClass
import scala.util.Try

object JwtSupport extends ConfigurationModuleImpl {

  private val typ = Option(config.getString("jwtToken.typ")).getOrElse("JWT")
  private val secret = config.getString("jwtToken.secret")
  private val timeout = Option(config.getLong("jwtToken.timeout")).getOrElse(60L)
  private val algorithm = Option(config.getString("jwtToken.algorithm")).map(JwtAlgorithm.fromString)
    .flatMap {
      case alg: JwtHmacAlgorithm => Option(alg)
      case _ => throw new RuntimeException("The algorithm is not support")
    }.getOrElse(JwtAlgorithm.HS256)
  private val header = JwtHeader(algorithm, typ)

  def generateToken(session: SessionClass): String = {
    val claim = JwtClaim(caseClass2json(session)).expiresIn(timeout)
    Jwt.encode(header, claim, secret)
  }

  def decodeToken(token: String): SessionClass = {
    val decodeToken: Try[(String, String, String)] = Jwt.decodeRawAll(token, secret, Seq(algorithm))
    val session = json2caseClass[SessionClass](decodeToken.get._2)
    session
  }

}
