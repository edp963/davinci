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

package edp.davinci.rest.user

import edp.davinci.ModuleInstance
import edp.davinci.module.DbModule._
import edp.davinci.persistence.entities._
import edp.davinci.rest.{LoginUserInfo, SessionClass}
import edp.davinci.util.ResponseUtils
import slick.jdbc.MySQLProfile.api._

import scala.concurrent.Future

object UserService extends UserService

trait UserService {
  private lazy val modules = ModuleInstance.getModule

  def getAll(session: SessionClass): Future[Seq[(Long, String, String, String, Boolean)]] = {
    val tmpQuery = modules.userQuery.filter(!_.admin)
    if (session.admin)
      db.run(tmpQuery.map(r => (r.id, r.email, r.title, r.name, r.admin)).result)
    else
      db.run(tmpQuery.filter(_.id === session.userId).map(r => (r.id, r.email, r.title, r.name, r.admin)).result)
  }

  def getUserGroup(userId: Long): Future[Seq[Long]] = {
    db.run(modules.relUserGroupQuery.filter(_.user_id === userId).map(_.group_id).result)
  }

  def getUserInfo(userId: Long): Future[(Boolean, String)] = {
    db.run(modules.userQuery.filter(_.id === userId).map(u=>(u.admin,u.email)).result.head)
  }

  def update(userSeq: Seq[PutUserInfo], session: SessionClass): Future[Unit] = {
    val query = DBIO.seq(userSeq.map(r => {
      modules.userQuery.filter(_.id === r.id).map(user => (user.admin, user.name, user.email, user.title, user.update_by, user.update_time)).update(r.admin, r.name, r.email, r.title, session.userId, ResponseUtils.currentTime)
    }): _*)
    db.run(query)
  }

  def updateLoginUser(loginUser: LoginUserInfo, session: SessionClass): Future[Int] = {
    db.run(modules.userQuery.filter(_.id === session.userId).map(user => (user.name, user.title, user.update_by, user.update_time)).update(loginUser.name, loginUser.title, session.userId, ResponseUtils.currentTime))
  }

  def getAllGroups(userId: Long): Future[Seq[PutRelUserGroup]] = {
    val query = modules.relUserGroupQuery.filter(rel => rel.user_id === userId)
      .map(r => (r.id, r.group_id)).result
    db.run(query).mapTo[Seq[PutRelUserGroup]]
  }


  def deleteAllRelByUserId(userSeq: Seq[PutUserInfo]): Future[Unit] = {
    val query = DBIO.seq(userSeq.map(r => {
      modules.relUserGroupQuery.filter(_.user_id === r.id).delete
    }): _*)
    db.run(query)
  }

  def getUserInfo(session: SessionClass): Future[Seq[(Long, String, String, String, Boolean, Boolean)]] = {
    db.run(modules.userQuery.filter(_.id === session.userId).map(r => (r.id, r.email, r.title, r.name, r.admin, r.active)).result)
  }

  def deleteUser(userId: Long): Future[Int] = {
    modules.userDal.deleteById(userId)
  }

  def deleteRelGU(userId: Long): Future[Int] = {
    modules.relUserGroupDal.deleteByFilter(_.user_id === userId)
  }
}
