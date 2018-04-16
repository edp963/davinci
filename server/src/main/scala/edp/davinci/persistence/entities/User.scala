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

import edp.davinci.persistence.base.{BaseEntity, BaseTable, SimpleBaseEntity}
import slick.jdbc.H2Profile.api._
import slick.lifted.ProvenShape

case class User(id: Long,
                email: String,
                password: String,
                title: String,
                name: String,
                admin: Boolean,
                active: Boolean,
                create_time: String,
                create_by: Long,
                update_time: String,
                update_by: Long) extends BaseEntity

case class User4Post(email: String,
                     password: String,
                     title: String,
                     name: String,
                     admin: Boolean,
                     relUG: Seq[PostRelUserGroup]
                       ) extends SimpleBaseEntity

case class User4Put(id: Long,
                    email: String,
                    title: String,
                    name: String,
                    admin: Boolean,
                    active: Option[Boolean] = Some(true),
                    relUG: Seq[PostRelUserGroup])

case class User4Query(id: Long,
                      email: String,
                      title: String,
                      name: String,
                      admin: Boolean)

case class PostUserSeq(payload: Seq[User4Post])

case class PutUserSeq(payload: Seq[User4Put])

case class LoginClass(username: String, password: String)

case class User4Login(title: String, name: String)

case class ChangePassword(oldPass: String, newPass: String)

case class ChangeUserPassword(id: Long, oldPass: String, newPass: String)

class UserTable(tag: Tag) extends BaseTable[User](tag, "user") {

  def password = column[String]("password")

  def title = column[String]("title")

  override def name = column[String]("name")

  def admin = column[Boolean]("admin")

  def create_time = column[String]("create_time")

  def create_by = column[Long]("create_by")

  def update_time = column[String]("update_time")

  def update_by = column[Long]("update_by")

  def * : ProvenShape[User] = (id, email, password, title, name, admin, active, create_time, create_by, update_time, update_by) <> (User.tupled, User.unapply)
}
