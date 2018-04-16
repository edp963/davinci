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
