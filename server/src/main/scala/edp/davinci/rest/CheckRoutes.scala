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

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes.{BadRequest, Forbidden, OK}
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.module.DbModule.db
import edp.davinci.module.{BusinessModule, ConfigurationModule, PersistenceModule}
import edp.davinci.persistence.base.BaseEntity
import edp.davinci.util.common.ResponseUtils._
import edp.davinci.util.common.AuthorizationProvider
import io.swagger.annotations.{ApiImplicitParams, _}
import org.apache.log4j.Logger
import slick.jdbc.MySQLProfile.api._
import edp.davinci.util.json.JsonProtocol._

import scala.concurrent.Future
import scala.util.{Failure, Success}

@Api(value = "/check", consumes = "application/json")
@Path("/check")
class CheckRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule) extends Directives {

  val routes: Route = nameCheckRoute
  private lazy val logger = Logger.getLogger(this.getClass)
  private lazy val routeName = "check"

  @Path("/name")
  @ApiOperation(value = "check unique name", notes = "", nickname = "", httpMethod = "get")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "name", value = "name", required = true, dataType = "string", paramType = "query"),
    new ApiImplicitParam(name = "entity", value = "entity name", required = true, dataType = "string", paramType = "query"),
    new ApiImplicitParam(name = "id", value = "entity id", required = false, dataType = "integer", paramType = "query")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "correct name"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def nameCheckRoute: Route = path(routeName / "name") {
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          parameters('entity.as[String], 'name.as[String], 'id.as[Long] ? 0) { (entity, name, id) =>
            if (session.admin) {
              onComplete(entityMatch(entity, name, id)) {
                case Success(seq) =>
                  if (seq.isEmpty) complete(OK, ResponseJson[String](getHeader(200, session), ""))
                  else complete(BadRequest, ResponseJson[String](getHeader(400, "名称已被使用", session), ""))
                case Failure(ex) => logger.error(s"nameCheckRoute error", ex)
                  complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
              }
            } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
          }
      }
    }
  }


  def entityMatch(entity: String, name: String, id: Long): Future[Seq[BaseEntity with Product with Serializable]] = {
    entity.toLowerCase match {
      case "dashboard" => if (id > 0) modules.dashboardDal.findByFilter(d => d.id =!= id && d.name === name)
      else modules.dashboardDal.findByFilter(_.name === name)
      case "widget" => if (id > 0) modules.widgetDal.findByFilter(d => d.id =!= id && d.name === name)
      else modules.widgetDal.findByFilter(_.name === name)
      case "view" => if (id > 0) modules.viewDal.findByFilter(d => d.id =!= id && d.name === name)
      else modules.viewDal.findByFilter(_.name === name)
      case "source" => if (id > 0) modules.sourceDal.findByFilter(d => d.id =!= id && d.name === name)
      else modules.sourceDal.findByFilter(_.name === name)
      case "group" => if (id > 0) modules.groupDal.findByFilter(d => d.id =!= id && d.name === name)
      else modules.groupDal.findByFilter(_.name === name)
      case "user" => if (id > 0) modules.userDal.findByFilter(d => d.id =!= id && d.email === name)
      else modules.userDal.findByFilter(_.email === name)
      case "cronjob"=>if(id > 0) modules.cronJobDal.findByFilter(d =>d.id =!= id && d.name === name)
      else modules.cronJobDal.findByFilter(_.name === name)
      case _ => throw new Exception("not supported entity type")
    }
  }


}
