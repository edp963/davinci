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

package edp.davinci.rest.group

import javax.ws.rs.Path
import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.util.ResponseUtils._
import edp.davinci.module._
import edp.davinci.persistence.entities.{PostGroupInfo, PutGroupInfo, UserGroup}
import edp.davinci.rest._
import edp.davinci.util.AuthorizationProvider
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.ResponseUtils.getHeader
import io.swagger.annotations._
import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global
import  edp.davinci.rest.group.GroupService._

@Api(value = "/groups", consumes = "application/json", produces = "application/json")
@Path("/groups")
class GroupRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  val routes: Route = getGroupByAllRoute ~ postGroupRoute ~ putGroupRoute ~ deleteGroupByIdRoute
  private lazy val routeName = "groups"

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
  def getGroupByAllRoute: Route = path(routeName) {
    get {
      parameter('active.as[Boolean].?) { active =>
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
          session => getAllGroupsComplete(session, active.getOrElse(true))
        }
      }
    }
  }

  private def getAllGroupsComplete(session: SessionClass, active: Boolean): Route = {
    if (session.admin) {
      onComplete(getAll(session)) {
        case Success(groupSeq) =>
          val purGroups = groupSeq.map(g => PutGroupInfo(g._1, g._2, g._3.getOrElse("")))
          complete(OK, ResponseSeqJson[PutGroupInfo](getHeader(200, session), purGroups))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @ApiOperation(value = "Add a new group to the system", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "group", value = "Group object to be added", required = true, dataType = "edp.davinci.rest.PostGroupInfoSeq", paramType = "body")
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
      entity(as[PostGroupInfoSeq]) {
        groupSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => postGroup(session, groupSeq.payload)
          }
      }
    }
  }

  private def postGroup(session: SessionClass, postGroupSeq: Seq[PostGroupInfo]) = {
    if (session.admin) {
      val groupSeq = postGroupSeq.map(post => UserGroup(0, post.name, Some(post.desc), active = true, currentTime, session.userId, currentTime, session.userId))
      onComplete(modules.groupDal.insert(groupSeq)) {
        case Success(groupWithIdSeq) =>
          val responseGroup = groupWithIdSeq.map(group => PutGroupInfo(group.id, group.name, group.desc.getOrElse(""), Some(group.active)))
          complete(OK, ResponseSeqJson[PutGroupInfo](getHeader(200, session), responseGroup))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))

  }

  @ApiOperation(value = "update a group in the system", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "group", value = "Group object to be updated", required = true, dataType = "edp.davinci.rest.PutGroupInfoSeq", paramType = "body")
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
      entity(as[PutGroupInfoSeq]) {
        groupSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => putGroupComplete(session, groupSeq.payload)
          }
      }
    }
  }

  private def putGroupComplete(session: SessionClass, groupSeq: Seq[PutGroupInfo]): Route = {
    if (session.admin) {
      val future = update(groupSeq, session)
      onComplete(future) {
        case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
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
  def deleteGroupByIdRoute: Route = path(routeName / LongNumber) { groupId =>
    delete {
      authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            val operation = for {
              group <- deleteGroup(groupId)
              relGF <- deleteRelGF(groupId)
              relGU <- deleteRelGU(groupId)
            } yield (group, relGF, relGU)
            onComplete(operation) {
              case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))

      }
    }
  }
}
