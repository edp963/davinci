package edp.davinci.rest.cronjob

import edp.davinci.ModuleInstance
import edp.davinci.module.DbModule._
import edp.davinci.persistence.entities.{CronJob, PutCronJob}
import edp.davinci.rest.SessionClass
import edp.davinci.util.quartz.EmailCronJobExecutor
import org.quartz.Job
import slick.jdbc.MySQLProfile.api._

import scala.concurrent.Future

object CronJobService extends CronJobService {
  def sendMail(cronJob: CronJob) = {
    println("iiii  lllll   ooooo vvvvvv eeeee")
  }


  def getJobExecutor(cronJob: CronJob): Class[_ <: Job] = {
    cronJob.job_type match {
      case "email" => (new EmailCronJobExecutor).getClass
      case _ => null
    }
  }
}

trait CronJobService {
  private lazy val modules = ModuleInstance.getModule

  def getAllCronJob(sessionClass: SessionClass): Future[Seq[CronJob]] = {
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

}
