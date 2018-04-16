package edp.davinci.rest.cronjob

import javax.ws.rs.Path
import akka.http.scaladsl.model.StatusCodes.{BadRequest, OK}
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.rest.cronjob.CronJobStatus.{NEW, STARTED, SUCCESS, STOPPED}
import edp.davinci.module.{BusinessModule, ConfigurationModule, PersistenceModule, RoutesModuleImpl}
import edp.davinci.persistence.entities.{CronJob, PostCronJobSeq, PutCronJobSeq}
import edp.davinci.rest.cronjob.CronJobService._
import edp.davinci.rest.{ResponseJson, ResponseSeqJson, SessionClass}
import edp.davinci.util.common.{AuthorizationProvider, ResponseUtils}
import edp.davinci.util.common.ResponseUtils.{currentTime, getHeader}
import edp.davinci.util.json.JsonProtocol._
import edp.davinci.util.quartz.QuartzManager
import io.swagger.annotations._
import org.apache.log4j.Logger

import scala.concurrent.Await
import scala.concurrent.duration.{FiniteDuration, SECONDS}
import scala.util.{Failure, Success}


@Api(value = "/cronjobs", consumes = "application/json", produces = "application/json")
@Path("/cronjobs")
class CronJobRoutes(modules: ConfigurationModule with PersistenceModule with BusinessModule with RoutesModuleImpl) extends Directives {

  private lazy val routeName = "cronjobs"
  private lazy val logger = Logger.getLogger(this.getClass)
  val routes = getAllJobsRoute ~ postJobsRoute ~ updateJobsRoute ~ deleteJobsRoute ~ startJobRoute ~ stopJobRoute

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
          onComplete(getOwnCronJob(session)) {
            case Success(cronJobSeq) =>
              complete(OK, ResponseSeqJson[CronJob](getHeader(200, session), cronJobSeq))
            case Failure(ex) =>
              logger.error(s"get all cron jobs error", ex)
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
            val cronJobs = postCronJobSeq.payload.map(p => CronJob(0, p.name, p.job_type, NEW, p.cron_pattern, p.start_date, p.end_date, p.config, p.desc, "", session.userId, currentTime, currentTime))
            onComplete(modules.cronJobDal.insert(cronJobs)) {
              case Success(jobs) =>
                complete(OK, ResponseSeqJson[CronJob](getHeader(200, session), jobs))
              case Failure(ex) =>
                logger.error(s"add cron job error", ex)
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
    put {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          entity(as[PutCronJobSeq]) { putCronJobSeq =>
           onComplete(updateCronJob(session, putCronJobSeq.payload)) {
              case Success(_) =>
                try{
                val cronJobs = putCronJobSeq.payload.map(p => CronJob(p.id, p.name, p.job_type, NEW, p.cron_pattern, p.start_date, p.end_date, p.config, p.desc, "", session.userId, currentTime, currentTime))
                QuartzManager.modifyJob(cronJobs.head)
                complete(OK, ResponseSeqJson[CronJob](getHeader(200, session), cronJobs))}catch{
                  case ex:Throwable =>complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
                }
              case Failure(ex) =>
                logger.error(s"update cron job error", ex)
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
              try{
              QuartzManager.removeJob(jobId.toString, jobId.toString)
              complete(OK, ResponseJson[String](getHeader(200, session), "删除成功"))}catch{
                case ex:Throwable =>complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
              }
            case Failure(ex) => logger.error(s"delete cron job  error", ex)
              complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    }
  }


  @Path("/start/{job_id}")
  @ApiOperation(value = "start job", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "job_id", value = "job_id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 404, message = "job not found"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def startJobRoute: Route = path(routeName / "start" / LongNumber) { jobId =>
    post {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(getJobById(session, jobId)) {
            case Success(job) =>
              try{
              QuartzManager.addJob(job)
              sendMail(job)
              val refreshStatusJob = CronJob(job.id, job.name, job.job_type, STARTED, job.cron_pattern, job.start_date, job.end_date, job.config, job.desc, STARTED, job.create_by, job.create_time, job.update_time)
              Await.result(updateCronJobStatus(job.id, STARTED, ResponseUtils.currentTime, STARTED), new FiniteDuration(30, SECONDS))
              complete(OK, ResponseSeqJson[CronJob](getHeader(200, session), Seq(refreshStatusJob)))}catch{
                case ex:Throwable =>complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
              }
            case Failure(ex) => logger.error(s"get cron job error", ex)
              complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    }
  }


  @Path("/stop/{job_id}")
  @ApiOperation(value = "stop job", notes = "", nickname = "", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "job_id", value = "job_id", required = true, dataType = "integer", paramType = "path")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "OK"),
    new ApiResponse(code = 401, message = "authorization error"),
    new ApiResponse(code = 404, message = "job not found"),
    new ApiResponse(code = 400, message = "bad request")
  ))
  def stopJobRoute: Route = path(routeName / "stop" / LongNumber) { jobId =>
    post {
      authenticateOAuth2Async[SessionClass](AuthorizationProvider.realm, AuthorizationProvider.authorize) {
        session =>
          onComplete(getJobById(session, jobId)) {
            case Success(job) =>
              try{
              QuartzManager.removeJob(job.id.toString, job.id.toString)
              val refreshStatusJob = CronJob(job.id, job.name, job.job_type, STOPPED, job.cron_pattern, job.start_date, job.end_date, job.config, job.desc, STOPPED, job.create_by, job.create_time, job.update_time)
              Await.result(updateCronJobStatus(job.id, STOPPED, ResponseUtils.currentTime, STOPPED), new FiniteDuration(30, SECONDS))
              complete(OK, ResponseSeqJson[CronJob](getHeader(200, session), Seq(refreshStatusJob)))}catch{
                case ex:Throwable =>complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
              }
            case Failure(ex) => logger.error(s"get cron job error", ex)
              complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
          }
      }
    }
  }


}
