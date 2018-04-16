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

package edp.davinci.persistence.entities

import edp.davinci.persistence.base.{BaseEntity, BaseTable}
import slick.jdbc.MySQLProfile.api._

case class CronJob(id: Long,
                   name: String,
                   job_type: String,
                   job_status: String,
                   cron_pattern: String,
                   start_date:String,
                   end_date:String,
                   config: String,
                   desc: Option[String],
                   exec_log: String,
                   create_by: Long,
                   create_time: String,
                   update_time: String
                  ) extends BaseEntity


case class PostCronJob(name: String,
                       job_type: String,
                       cron_pattern: String,
                       start_date:String,
                       end_date:String,
                       config: String,
                       desc: Option[String])


case class PutCronJob(id: Long,
                      name: String,
                      job_type: String,
                      cron_pattern: String,
                      start_date:String,
                      end_date:String,
                      config: String,
                      desc: Option[String])


case class PostCronJobSeq(payload: Seq[PostCronJob])

case class PutCronJobSeq(payload: Seq[PutCronJob])

case class CronJobSeq(payload:Seq[CronJob])


case class EmailCronJobConfig(to: String,
                              cc: Option[String]=Some(""),
                              bcc:Option[String]=Some(""),
                              subject: String,
                              contentList:Seq[Content],
                              `type`:String)

case class Content(id:Long,`type`:String)

class CronJobTable(tag: Tag) extends BaseTable[CronJob](tag, "cron_job") {
  //  def name = column[String]("name")
  def job_type = column[String]("job_type")

  def job_status = column[String]("job_status")

  def cron_pattern = column[String]("cron_pattern")

  def start_date = column[String]("start_date")

  def end_date = column[String]("end_date")

  def config = column[String]("config")

  def desc = column[Option[String]]("desc")

  def exec_log = column[String]("exec_log")

  def create_time = column[String]("create_time")

  def create_by = column[Long]("create_by")

  def update_time = column[String]("update_time")

  def * = (id, name, job_type, job_status, cron_pattern,start_date,end_date, config, desc, exec_log, create_by, create_time, update_time) <> (CronJob.tupled, CronJob.unapply)
}
