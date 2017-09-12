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

case class View(id: Long,
                source_id: Long,
                name: String,
                sql_tmpl: String,
                result_table: String,
                desc: Option[String] = None,
                trigger_type: String,
                frequency: String,
                `catch`: String,
                active: Boolean,
                create_time: String,
                create_by: Long,
                update_time: String,
                update_by: Long) extends BaseEntity


case class PostViewInfo(source_id: Long,
                        name: String,
                        sql_tmpl: String,
                        desc: String,
                        trigger_type: String,
                        frequency: String,
                        `catch`: String,
                        relBG: Seq[PostRelGroupView]) extends SimpleBaseEntity

case class PutViewInfo(id: Long,
                       source_id: Long,
                       name: String,
                       sql_tmpl: String,
                       desc: String,
                       trigger_type: String,
                       frequency: String,
                       `catch`: String,
                       active: Option[Boolean] = Some(true),
                       relBG: Seq[PostRelGroupView])


case class QueryView(id: Long,
                     source_id: Long,
                     name: String,
                     sql_tmpl: String,
                     desc: String,
                     trigger_type: String,
                     frequency: String,
                     `catch`: String,
                     result_table: String,
                     active: Boolean)


class ViewTbl(tag: Tag) extends BaseTable[View](tag, "flattable") {

  def sql_tmpl: Rep[String] = column[String]("sql_tmpl")

  def result_table: Rep[String] = column[String]("result_table")

  def source_id: Rep[Long] = column[Long]("source_id")

  def desc: Rep[Option[String]] = column[Option[String]]("desc")

  def trigger_type: Rep[String] = column[String]("trigger_type")

  def frequency: Rep[String] = column[String]("frequency")

  def `catch`: Rep[String] = column[String]("catch")

  def create_time: Rep[String] = column[String]("create_time")

  def create_by: Rep[Long] = column[Long]("create_by")

  def update_time: Rep[String] = column[String]("update_time")

  def update_by: Rep[Long] = column[Long]("update_by")

  def * : ProvenShape[View] = (id, source_id, name, sql_tmpl, result_table, desc, trigger_type, frequency, `catch`, active, create_time, create_by, update_time, update_by) <> (View.tupled, View.unapply)
}
