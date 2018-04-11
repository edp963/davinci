package edp.davinci.rest.cronjob

import edp.davinci.ModuleInstance
import edp.davinci.module.DbModule._
import edp.davinci.persistence.entities.{CronJob, PutCronJob}
import edp.davinci.rest.SessionClass
import edp.davinci.util.common.ResponseUtils
import edp.davinci.util.quartz.{EmailCronJobExecutor, QuartzManager}
import org.apache.log4j.Logger
import org.quartz.Job
import slick.jdbc.MySQLProfile.api._
import CronJobStatus._
import scala.concurrent.duration.FiniteDuration
import scala.concurrent.{Await, Future}
import scala.concurrent.duration.SECONDS

object CronJobService extends CronJobService {
  private lazy val logger = Logger.getLogger(this.getClass)

  def sendMail(cronJob: CronJob) = {
    try {
      Await.result(updateCronJobStatus(cronJob.id, STARTING, ResponseUtils.currentTime, STARTING), new FiniteDuration(30, SECONDS))
      EmailService.sendEmailWithImage(cronJob)
      Await.result(updateCronJobStatus(cronJob.id, SUCCESS, ResponseUtils.currentTime, SUCCESS), new FiniteDuration(30, SECONDS))
    }
    catch {
      case ex: Throwable =>
        logger.error("send email ", ex)
        updateCronJobStatus(cronJob.id, FAILED, ResponseUtils.currentTime, ex.getMessage)
    }
  }


  def getJobExecutor(cronJob: CronJob): Class[_ <: Job] = {
    cronJob.job_type match {
      case "email" => new (EmailCronJobExecutor).getClass
      case _ => null
    }
  }

  def loadAllJobs() = {
    val allJobs = Await.result(getAllCronJob(), new FiniteDuration(30, SECONDS))
    allJobs.foreach(QuartzManager.addJob)
  }
}

trait CronJobService {
  private lazy val modules = ModuleInstance.getModule

  def getOwnCronJob(sessionClass: SessionClass): Future[Seq[CronJob]] = {
    db.run(modules.cronJobQuery.filter(_.create_by === sessionClass.userId).result).mapTo[Seq[CronJob]]
  }


  def updateCronJob(sessionClass: SessionClass, cronJobSeq: Seq[PutCronJob]): Future[Unit] = {
    val query = DBIO.seq(cronJobSeq.map(cronJob => {
      modules.cronJobQuery.filter(c => c.create_by === sessionClass.userId && c.id === cronJob.id).
        map(c => (c.name, c.job_type, c.cron_pattern, c.start_date, c.end_date, c.config, c.desc)).
        update(cronJob.name, cronJob.job_type, cronJob.cron_pattern, cronJob.start_date, cronJob.end_date, cronJob.config, cronJob.desc)
    }): _*)
    db.run(query)
  }

  def deleteCronJob(sessionClass: SessionClass, jobId: Long): Future[Int] = {
    db.run(modules.cronJobQuery.filter(c => c.create_by === sessionClass.userId && c.id === jobId).delete)
  }


  def updateCronJobStatus(jobId: Long, jobStatus: String, updateTime: String, execLog: String): Future[Int] = {
    db.run(modules.cronJobQuery.filter(_.id === jobId).map(c => (c.job_status, c.update_time, c.exec_log))
      .update(jobStatus, updateTime, execLog))
  }

  def getAllCronJob() = {
    db.run(modules.cronJobQuery.filter(_.job_status =!= STOPPED).result).mapTo[Seq[CronJob]]
  }

  def getJobById(sessionClass: SessionClass, id: Long): Future[CronJob] = {
    db.run(modules.cronJobQuery.filter(c => c.create_by === sessionClass.userId && c.id === id).result.head)
  }

}
