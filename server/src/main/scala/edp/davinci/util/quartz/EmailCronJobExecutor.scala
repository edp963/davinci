package edp.davinci.util.quartz

import edp.davinci.persistence.entities.CronJob
import edp.davinci.rest.cronjob.CronJobService
import org.apache.log4j.Logger
import org.quartz.{Job, JobExecutionContext, SchedulerException}

class EmailCronJobExecutor extends Job {
  private lazy val logger = Logger.getLogger(this.getClass)

  override def execute(context: JobExecutionContext): Unit = {
    try {
      CronJobService.sendMail(context.getMergedJobDataMap.get("job").asInstanceOf[CronJob])
    } catch {
      case e: SchedulerException =>
        logger.error("", e)
    }

  }

}
