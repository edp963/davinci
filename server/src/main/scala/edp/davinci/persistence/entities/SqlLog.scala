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

package edp.davinci.persistence.entities

import edp.davinci.persistence.base.{BaseEntity, BaseTable, SimpleBaseEntity}
import slick.jdbc.H2Profile.api._
import slick.lifted.ProvenShape

case class SqlLog(id: Long,
                  user_id: Long,
                  user_email: String,
                  sql: String,
                  start_time: String,
                  end_time: String,
                  success: Boolean,
                  error: String) extends BaseEntity

case class SimpleSqlLog(user_id: Long,
                        user_email: String,
                        sql: String,
                        start_time: String,
                        end_time: String,
                        success: Boolean,
                        error: String) extends SimpleBaseEntity


class SqlLogTable(tag: Tag) extends BaseTable[SqlLog](tag, "sql_log") {
  def user_email: Rep[String] = column[String]("user_email")

  def sql: Rep[String] = column[String]("sql")

  def user_id: Rep[Long] = column[Long]("user_id")

  def start_time: Rep[String] = column[String]("start_time")

  def end_time: Rep[String] = column[String]("end_time")

  def success: Rep[Boolean] = column[Boolean]("success")

  def error: Rep[String] = column[String]("error")

  def * : ProvenShape[SqlLog] = (id, user_id, user_email, sql, start_time, end_time, success, error) <> (SqlLog.tupled, SqlLog.unapply)
}
