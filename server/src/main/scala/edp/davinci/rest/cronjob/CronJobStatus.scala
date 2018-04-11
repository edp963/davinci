package edp.davinci.rest.cronjob

object CronJobStatus {
  lazy val SUCCESS = "success"
  lazy val STARTED = "started"
  lazy val STOPPED = "stopped"
  lazy val FAILED = "failed"
  lazy val STARTING = "starting"
  lazy val NEW = "new"
}
