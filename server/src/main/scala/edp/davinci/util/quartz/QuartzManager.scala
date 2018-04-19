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

package edp.davinci.util.quartz

import java.util.Date

import edp.davinci.persistence.entities.CronJob
import edp.davinci.rest.cronjob.CronJobService.getJobExecutor
import edp.davinci.util.common.DateUtils.dt2dateInternal
import org.quartz._
import org.quartz.impl.StdSchedulerFactory

object QuartzManager {
  private val schedulerFactory = new StdSchedulerFactory

  def addJob(cronJob: CronJob): Unit = try {
    val sched = schedulerFactory.getScheduler

    // 任务名，任务组，任务执行类
    val jobDetail = JobBuilder.newJob(getJobExecutor(cronJob)).withIdentity(cronJob.id.toString).build()
    // 触发器
    jobDetail.getJobDataMap.put("job", cronJob)
    val startTimeStamp = dt2dateInternal(cronJob.start_date).getTime
    val endTimeStamp = dt2dateInternal(cronJob.end_date).getTime
    if (endTimeStamp > System.currentTimeMillis()) {
      val triggerBuilder = TriggerBuilder.newTrigger.withIdentity(cronJob.id.toString)
      triggerBuilder.startAt(if (startTimeStamp > new Date().getTime) dt2dateInternal(cronJob.start_date) else new Date())
        .withSchedule(CronScheduleBuilder.cronSchedule(cronJob.cron_pattern))
        .endAt(dt2dateInternal(cronJob.end_date))
      // 创建Trigger对象
      val trigger = triggerBuilder.build.asInstanceOf[CronTrigger]
      // 调度容器设置JobDetail和Trigger
      sched.scheduleJob(jobDetail, trigger)
      // 启动
      if (!sched.isShutdown) sched.start()
    }
  } catch {
    case e: Exception =>
      throw new RuntimeException(e)
  }

  def modifyJob(cronJob: CronJob): Unit = try {
    val sched = schedulerFactory.getScheduler
    val triggerKey = TriggerKey.triggerKey(cronJob.id.toString)
    val trigger = sched.getTrigger(triggerKey).asInstanceOf[CronTrigger]
    if (trigger != null) {
      removeJob(cronJob.id.toString, cronJob.id.toString)
      addJob(cronJob)
    }
  } catch {
    case e: Exception =>
      throw new RuntimeException(e)
  }

  def removeJob(jobName: String, triggerName: String): Unit = try {
    val sched = schedulerFactory.getScheduler
    val triggerKey = TriggerKey.triggerKey(triggerName)
    sched.pauseTrigger(triggerKey) // 停止触发器
    sched.unscheduleJob(triggerKey) // 移除触发器
    sched.deleteJob(JobKey.jobKey(jobName)) // 删除任务
  } catch {
    case e: Exception =>
      throw new RuntimeException(e)
  }

  def startJobs(): Unit = try {
    val sched = schedulerFactory.getScheduler
    sched.start()
  } catch {
    case e: Exception =>
      throw new RuntimeException(e)
  }

  def shutdownJobs(): Unit = try {
    val sched = schedulerFactory.getScheduler
    if (!sched.isShutdown) sched.shutdown()
  } catch {
    case e: Exception =>
      throw new RuntimeException(e)
  }
}
