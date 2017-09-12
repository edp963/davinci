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

package edp.davinci.rest.source

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.module.{BusinessModule, ConfigurationModule, PersistenceModule, RoutesModuleImpl}
import edp.davinci.persistence.entities.{PostSourceInfo, PutSourceInfo, Source}
import edp.davinci.rest._
import edp.davinci.util.AuthorizationProvider
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.ResponseUtils.getHeader
import io.swagger.annotations._
import org.apache.log4j.Logger
import edp.davinci.util.ResponseUtils._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}


@Api(value = "/sources", consumes = "application/json", produces = "application/json")
@Path("/sources")
class SourceRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  val routes: Route = getSourceByAllRoute ~ postSourceRoute ~ putSourceRoute ~ deleteSourceByIdRoute
  private lazy val logger = Logger.getLogger(this.getClass)
  private lazy val routeName = "sources"

  @ApiOperation(value = "get all source with the same domain", notes = "", nickname = "", httpMethod = "GET")
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
  def getSourceByAllRoute: Route = path(routeName) {
    get {
      parameter('active.as[Boolean].?) { active =>
        authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
          session => getAllSourcesComplete(session, active.getOrElse(true))
        }
      }
    }
  }

  private def getAllSourcesComplete(session: SessionClass, active: Boolean): Route = {
    if (session.admin) {
      onComplete(SourceService.getAll) {
        case Success(sourceSeq) =>
          val responseSource = sourceSeq.map(s => PutSourceInfo(s._1, s._2, s._3, s._4, s._5, s._6, Some(true)))
          complete(OK, ResponseSeqJson[PutSourceInfo](getHeader(200, session), responseSource))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @ApiOperation(value = "Add new sources to the system", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "sources", value = "Source objects to be added", required = true, dataType = "edp.davinci.rest.PostSourceInfoSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "post success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def postSourceRoute: Route = path(routeName) {
    post {
      entity(as[PostSourceInfoSeq]) {
        sourceSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => postSource(session, sourceSeq.payload)
          }
      }
    }
  }


  private def postSource(session: SessionClass, postSourceSeq: Seq[PostSourceInfo]): Route = {
    if (session.admin) {
      val sourceSeq = postSourceSeq.map(post => Source(0, post.name, post.connection_url, post.desc, post.`type`, post.config, active = true, currentTime, session.userId, currentTime, session.userId))
      onComplete(modules.sourceDal.insert(sourceSeq)) {
        case Success(sourceWithIdSeq) =>
          val responseSourceSeq = sourceWithIdSeq.map(source => PutSourceInfo(source.id, source.name, source.connection_url, source.desc, source.`type`, source.config, Some(source.active)))
          complete(OK, ResponseSeqJson[PutSourceInfo](getHeader(200, session), responseSourceSeq))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @ApiOperation(value = "update sources in the system", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "sources", value = "Source objects to be updated", required = true, dataType = "edp.davinci.rest.PutSourceInfoSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "put success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 404, message = "sources not found"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def putSourceRoute: Route = path(routeName) {
    put {
      entity(as[PutSourceInfoSeq]) {
        sourceSeq =>
          authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
            session => putSourceComplete(session, sourceSeq.payload)
          }
      }
    }
  }

  private def putSourceComplete(session: SessionClass, sourceSeq: Seq[PutSourceInfo]): Route = {
    if (session.admin) {
      val future = SourceService.update(sourceSeq, session)
      onComplete(future) {
        case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  @Path("/{id}")
  @ApiOperation(value = "delete source by id", notes = "", nickname = "", httpMethod = "DELETE")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", value = "source id ", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "delete success"),
    new ApiResponse(code = 403, message = "user is not admin"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def deleteSourceByIdRoute: Route = path(routeName / LongNumber) { sourceId =>
    delete {
      authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
        session =>
          if (session.admin) {
            val operation = for {
              source <- SourceService.deleteSource(sourceId)
              flatTable <- SourceService.updateView(sourceId)
            } yield (source, flatTable)
            onComplete(operation) {
              case Success(_) => complete(OK, ResponseJson[String](getHeader(200, session), ""))
              case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
      }
    }
  }

}
