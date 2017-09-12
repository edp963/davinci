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

package edp.davinci.rest.user

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.module._
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import edp.davinci.util.AuthorizationProvider
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.ResponseUtils.getHeader
import io.swagger.annotations._
import org.apache.log4j.Logger
import edp.davinci.util.ResponseUtils._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

@Api(value = "/users", consumes = "application/json", produces = "application/json")
@Path("/users")
class UserRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  val routes: Route = postUserRoute ~ putUserRoute ~ putLoginUserRoute ~ getUserByAllRoute ~ deleteUserByIdRoute ~ getGroupsByUserIdRoute ~ deleteUserFromGroupRoute ~ getUserInfoByToken
  private lazy val logger = Logger.getLogger(this.getClass)
  private lazy val routeName = "users"

  @ApiOperation(value = "get all users with the same domain", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "active", value = "true or false", required = false, dataType = "boolean", paramType = "query")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "sources not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getUserByAllRoute: Route = path(routeName) {
    get {
      parameter('active.as[Boolean].?) { active =>
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
          session => getAllUsersComplete(session, active.getOrElse(true))
        }
      }
    }
  }

  private def getAllUsersComplete(session: SessionClass, active: Boolean): Route = {
    if (session.admin) {
      onComplete(UserService.getAll(session)) {
        case Success(userSeq) =>
          val responseUser = userSeq.map(u => QueryUserInfo(u._1, u._2, u._3, u._4, u._5, active = true))
          complete(OK, ResponseSeqJson[QueryUserInfo](getHeader(200, session), responseUser))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))

  }

  @ApiOperation(value = "Add new users to the system", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "users", value = "User objects to be added", required = true, dataType = "edp.davinci.rest.PostUserInfoSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "sources not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def postUserRoute: Route = path(routeName) {
    post {
      entity(as[PostUserInfoSeq]) {
        userSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => postUserComplete(session, userSeq.payload)
          }
      }
    }
  }


  private def postUserComplete(session: SessionClass, userSeq: Seq[PostUserInfo]): Route = {
    if (session.admin) {
      val userEntity = userSeq.map(postUser => User(0, postUser.email, postUser.password, postUser.title, postUser.name, postUser.admin, active = true, currentTime, session.userId, currentTime, session.userId))
      val operation = for {
        users <- modules.userDal.insert(userEntity)
        _ <- {
          val entities = users.flatMap(u => {
            userSeq.head.relUG.map(rel => RelUserGroup(0, u.id, rel.group_id, active = true, currentTime, session.userId, currentTime, session.userId))
          })
          modules.relUserGroupDal.insert(entities)
        }
      } yield users
      onComplete(operation) {
        case Success(users) =>
          val queryUsers = users.map(user => QueryUserInfo(user.id, user.email, user.title, user.name, user.admin, user.active))
          complete(OK, ResponseSeqJson[QueryUserInfo](getHeader(200, session), queryUsers))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @ApiOperation(value = "update users in the system", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "user", value = "User objects to be updated", required = true, dataType = "edp.davinci.rest.PutUserInfoSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "put success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "sources not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def putUserRoute: Route = path(routeName) {
    put {
      entity(as[PutUserInfoSeq]) {
        userSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => putUserComplete(session, userSeq.payload)
          }
      }
    }
  }


  private def putUserComplete(session: SessionClass, userSeq: Seq[PutUserInfo]): Route = {
    if (session.admin) {
      val operation = for {
        a <- UserService.update(userSeq, session)
        b <- UserService.deleteAllRelByUserId(userSeq)
        c <- {
          val relSeq = for {rel <- userSeq.head.relUG
          } yield RelUserGroup(0, userSeq.head.id, rel.group_id, active = true, currentTime, session.userId, currentTime, session.userId)
          modules.relUserGroupDal.insert(relSeq)
        }
      } yield (a, b, c)
      onComplete(operation) {
        case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    }
    else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }

  @Path("/profile")
  @ApiOperation(value = "update login users profile", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "user", value = "login user objects to be updated", required = true, dataType = "edp.davinci.rest.LoginUserInfo", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "put success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "users not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def putLoginUserRoute: Route = path(routeName / "profile") {
    put {
      entity(as[LoginUserInfo]) {
        user =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => putLoginUserComplete(session, user)
          }
      }
    }
  }

  private def putLoginUserComplete(session: SessionClass, user: LoginUserInfo): Route = {
    val future = UserService.updateLoginUser(user, session)
    onComplete(future) {
      case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
      case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
    }
  }


  @Path("/{id}")
  @ApiOperation(value = "delete user by id", notes = "", nickname = "", httpMethod = "DELETE")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", value = "user id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "delete success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "users not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def deleteUserByIdRoute: Route = path(routeName / LongNumber) {
    userId =>
      delete {
        authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
          session =>
            if (session.admin) {
              val operation = for {
                user <- UserService.deleteUser(userId)
                relGU <- UserService.deleteRelGU(userId)
              } yield (user, relGU)
              onComplete(operation) {
                case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
                case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
              }
            } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
        }
      }
  }


  @Path("/{user_id}/groups")
  @ApiOperation(value = "get groups by user id", notes = "", nickname = "", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "user_id", value = "user id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "ok"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "users not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getGroupsByUserIdRoute: Route = path(routeName / LongNumber / "groups") { userId =>
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session => getGroupsByUserIdComplete(session, userId)
      }

    }
  }

  private def getGroupsByUserIdComplete(session: SessionClass, userId: Long): Route = {
    val future = UserService.getAllGroups(userId)
    onComplete(future) {
      case Success(relSeq) => complete(OK, ResponseSeqJson[PutRelUserGroup](getHeader(200, session), relSeq))
      case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
    }
  }

  @Path("/groups/{rel_id}")
  @ApiOperation(value = "remove user from group by rel id", notes = "", nickname = "", httpMethod = "DELETE")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "rel_id", value = "rel id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "delete success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "users not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def deleteUserFromGroupRoute: Route = path(routeName / "groups" / LongNumber) { relId =>
    delete {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            onComplete(modules.relUserGroupDal.deleteById(relId).mapTo[Int]) {
              case Success(r) => complete(OK, ResponseJson[Int](getHeader(200, session), r))
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
      }
    }
  }

  @Path("/token")
  @ApiOperation(value = "remove user from group by rel id", notes = "", nickname = "", httpMethod = "GET")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "users not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getUserInfoByToken: Route = path("users" / "token") {
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(UserService.getUserInfo(session)) {
            case Success(userSeq) =>
              val responseUser = userSeq.map(u => QueryUserInfo(u._1, u._2, u._3, u._4, u._5, u._6))
              complete(OK, ResponseSeqJson[QueryUserInfo](getHeader(200, session), responseUser))
            case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    }
  }


}
