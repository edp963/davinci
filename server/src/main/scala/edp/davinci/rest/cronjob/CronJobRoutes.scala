package edp.davinci.rest.cronjob

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes.{BadRequest, OK}
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.module.{BusinessModule, ConfigurationModule, PersistenceModule, RoutesModuleImpl}
import edp.davinci.persistence.entities.{CronJob, PostCronJobSeq, PutCronJobSeq}
import edp.davinci.rest.cronjob.CronJobService._
import edp.davinci.rest.{ResponseJson, ResponseSeqJson, SessionClass}
import edp.davinci.util.common.AuthorizationProvider
import edp.davinci.util.common.ResponseUtils.{currentTime, getHeader}
import edp.davinci.util.json.JsonProtocol._
import edp.davinci.util.quartz.QuartzManager
import io.swagger.annotations._
import org.apache.log4j.Logger

import scala.util.{Failure, Success}


@Api(value = "/cronjobs", consumes = "application/json", produces = "application/json")
@Path("/cronjobs")
class CronJobRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  private lazy val routeName = "cronjobs"
  private lazy val logger = Logger.getLogger(this.getClass)
  val routes = getAllJobsRoute ~ postJobsRoute ~ updateJobsRoute ~ deleteJobsRoute

  @ApiOperation(value = "get all jobs", notes = "", nickname = "", httpMethod = "GET")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def getAllJobsRoute: Route = path(routeName) {
    get {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(getAllCronJob(session)) {
            case Success(cronJobSeq) =>
              complete(OK, ResponseSeqJson[CronJob](getHeader(200, session), cronJobSeq))
            case Failure(ex) =>
              logger.error(s"get all dashboards error", ex)
              complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    }
  }


  @ApiOperation(value = "add jobs", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "cron job seq", value = "cronJobSeq", required = true, dataType = "edp.davinci.persistence.entities.PostCronJobSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 404, message = "job not found"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def postJobsRoute: Route = path(routeName) {
    post {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          entity(as[PostCronJobSeq]) { postCronJobSeq =>
            val cronJobs = postCronJobSeq.payload.map(p => CronJob(0, p.name, p.job_type, "new", p.cron_pattern, p.start_date, p.end_date, p.config, p.desc, "", session.userId, currentTime, currentTime))
            onComplete(modules.cronJobDal.insert(cronJobs)) {
              case Success(_) =>
                QuartzManager.addJob(cronJobs.head)
                complete(OK, ResponseSeqJson[CronJob](getHeader(200, session), cronJobs))
              case Failure(ex) =>
                logger.error(s"get all dashboards error", ex)
                complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          }
      }
    }
  }


  @ApiOperation(value = "update job", notes = "", nickname = "", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "cron job", value = " put cronJob", required = true, dataType = "edp.davinci.persistence.entities.PutCronJobSeq", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 404, message = "job not found"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def updateJobsRoute: Route = path(routeName) {
    post {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          entity(as[PutCronJobSeq]) { putCronJobSeq =>
            val cronJobs = putCronJobSeq.payload.map(p => CronJob(0, p.name, p.job_type, "new", p.cron_pattern, p.start_date, p.end_date, p.config, p.desc, "", session.userId, currentTime, currentTime))
            onComplete(updateCronJob(session, putCronJobSeq.payload)) {
              case Success(_) =>
                QuartzManager.modifyJob(cronJobs.head)
                complete(OK, ResponseSeqJson[CronJob](getHeader(200, session), cronJobs))
              case Failure(ex) =>
                logger.error(s"get all dashboards error", ex)
                complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
            }
          }
      }
    }
  }


  @Path("/{job_id}")
  @ApiOperation(value = "delete job", notes = "", nickname = "", httpMethod = "DELETE")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "job_id", value = "job_id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 404, message = "job not found"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def deleteJobsRoute: Route = path(routeName / LongNumber) { jobId =>
    delete {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(deleteCronJob(session, jobId)) {
            case Success(_) =>
              QuartzManager.removeJob(jobId.toString, jobId.toString)
              complete(OK, ResponseJson[String](getHeader(200, session), "删除成功"))
            case Failure(ex) => logger.error(s"get all dashboards error", ex)
              complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    }
  }


}
