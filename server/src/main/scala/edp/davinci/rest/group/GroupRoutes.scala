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





package edp.davinci.rest.group

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.module._
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import edp.davinci.rest.group.GroupService._
import edp.davinci.util.json.JsonProtocol._
import edp.davinci.util.common.ResponseUtils.{getHeader, _}
import edp.davinci.util.common.AuthorizationProvider
import io.swagger.annotations._
import org.apache.log4j.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

@Api(value = "/groups", consumes = "application/json", produces = "application/json")
@Path("/groups")
class GroupRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  val routes: Route = getGroupsRoute ~ postGroupRoute ~ putGroupRoute ~ deleteGroupRoute
  private lazy val routeName = "groups"
  private lazy val logger = Logger.getLogger(this.getClass)

  @ApiOperation(value = "get all group with the same domain", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "active", value = "true or false", required = false, dataType = "boolean", paramType = "query")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "dashboard not found"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getGroupsRoute: Route = path(routeName) {
    get {
      parameter('active.as[Boolean].?) { active =>
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
          session => getGroupsComplete(session, active.getOrElse(true))
        }
      }
    }
  }

  private def getGroupsComplete(session: SessionClass, active: Boolean): Route = {
    if (session.admin) {
      onComplete(getGroups(session)) {
        case Success(groupSeq) =>
          complete(OK, ResponseSeqJson[Group4Put](getHeader(200, session), groupSeq))
        case Failure(ex) => logger.error("get all groups error", ex)
          complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @ApiOperation(value = "Add a new group to the system", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "group", value = "Group object to be added", required = true, dataType = "edp.davinci.persistence.entities.Group4PostSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "dashboard not found"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def postGroupRoute: Route = path(routeName) {
    post {
      entity(as[Group4PostSeq]) {
        groupSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => postGroup(session, groupSeq.payload)
          }
      }
    }
  }

  private def postGroup(session: SessionClass, postGroupSeq: Seq[Group4Post]) = {
    if (session.admin) {
      val groupSeq = postGroupSeq.map(post => UserGroup(0, post.name, Some(post.desc), active = true, currentTime, session.userId, currentTime, session.userId))
      onComplete(modules.groupDal.insert(groupSeq)) {
        case Success(groups) =>
          val groups4Put = groups.map(group => Group4Put(group.id, group.name, group.desc))
          complete(OK, ResponseSeqJson[Group4Put](getHeader(200, session), groups4Put))
        case Failure(ex) => logger.error("postGroup error", ex)
          complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))

  }

  @ApiOperation(value = "update a group in the system", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "group", value = "Group object to be updated", required = true, dataType = "edp.davinci.persistence.entities.Group4PutSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "put success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "group not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def putGroupRoute: Route = path(routeName) {
    put {
      entity(as[Group4PutSeq]) {
        groupSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => putGroup(session, groupSeq.payload)
          }
      }
    }
  }

  private def putGroup(session: SessionClass, groupSeq: Seq[Group4Put]): Route = {
    if (session.admin) {
      val future = update(groupSeq, session)
      onComplete(future) {
        case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
        case Failure(ex) => logger.error("put group error", ex)
          complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }

  @Path("/{id}")
  @ApiOperation(value = "delete group by id", notes = "", nickname = "", httpMethod = "DELETE")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", value = "group id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "delete success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def deleteGroupRoute: Route = path(routeName / LongNumber) { groupId =>
    delete {
      authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            onComplete(deleteGroup(groupId, session)) {
              case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
              case Failure(ex) => logger.error("deleteGroupByIdRoute error", ex)
                complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))

      }
    }
  }
}
