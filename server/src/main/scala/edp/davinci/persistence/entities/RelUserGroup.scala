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

case class RelUserGroup(id: Long,
                        user_id: Long,
                        group_id: Long,
                        active: Boolean,
                        create_time: String,
                        create_by: Long,
                        update_time: String,
                        update_by: Long) extends BaseEntity

case class SimpleRelUserGroup(user_id: Long,
                              group_id: Long,
                              active: Boolean,
                              create_time: String,
                              create_by: Long,
                              update_time: String,
                              update_by: Long) extends SimpleBaseEntity

case class PostRelUserGroup(group_id: Long) extends SimpleBaseEntity

case class PutRelUserGroup(relId: Long, group_id: Long)


class RelUserGroupTable(tag: Tag) extends BaseTable[RelUserGroup](tag, "rel_user_group") {
  def user_id: Rep[Long] = column[Long]("user_id")

  def group_id: Rep[Long] = column[Long]("group_id")

  def create_time: Rep[String] = column[String]("create_time")

  def create_by: Rep[Long] = column[Long]("create_by")

  def update_time: Rep[String] = column[String]("update_time")

  def update_by: Rep[Long] = column[Long]("update_by")

  def * : ProvenShape[RelUserGroup] = (id, user_id, group_id, active, create_time, create_by, update_time, update_by) <> (RelUserGroup.tupled, RelUserGroup.unapply)
}
