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

case class RelGroupView(id: Long, group_id: Long, flatTable_id: Long, sql_params: Option[String], active: Boolean, create_time: String, create_by: Long, update_time: String, update_by: Long) extends BaseEntity


case class SimpleRelGroupView(group_id: Long,
                              flatTable_id: Long,
                              sql_params: String,
                              active: Boolean,
                              create_time: String,
                              create_by: Long,
                              update_time: String,
                              update_by: Long) extends SimpleBaseEntity

case class PostRelGroupView(group_id: Long,
                            sql_params: String) extends SimpleBaseEntity

case class PutRelGroupView(id: Long,
                           group_id: Long,
                           sql_params: String)

case class PostRelGroupViewSeq(payload: Seq[PostRelGroupView])

case class PutRelGroupViewSeq(payload: Seq[PutRelGroupView])

class RelGroupViewTable(tag: Tag) extends BaseTable[RelGroupView](tag, "rel_group_view") {
  def group_id = column[Long]("group_id")

  def flatTable_id = column[Long]("flatTable_id")

  def sql_params = column[Option[String]]("sql_params")

  def create_time = column[String]("create_time")

  def create_by = column[Long]("create_by")

  def update_time = column[String]("update_time")

  def update_by = column[Long]("update_by")

  def * = (id, group_id, flatTable_id, sql_params, active, create_time, create_by, update_time, update_by) <> (RelGroupView.tupled, RelGroupView.unapply)
}
