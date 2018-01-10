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
import edp.davinci.rest.SessionClass
import edp.davinci.util.ResponseUtils
import edp.davinci.util.ResponseUtils.currentTime
import slick.jdbc.MySQLProfile.api._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object UserService extends UserService

trait UserService {
  private lazy val modules = ModuleInstance.getModule

  def getAllUsers(session: SessionClass): Future[Seq[QueryUserInfo]] = {
    val userInfo = db.run(modules.userQuery.map(r => (r.id, r.email, r.title, r.name, r.admin) <> (QueryUserInfo.tupled, QueryUserInfo.unapply)).result)
    userInfo.mapTo[Seq[QueryUserInfo]]
  }

  def getUserGroup(userId: Long): Future[Seq[Long]] = {
    db.run(modules.relUserGroupQuery.filter(_.user_id === userId).map(_.group_id).result)
  }

  def getUserById(userId: Long): Future[(Boolean, String)] = {
    db.run(modules.userQuery.filter(_.id === userId).map(u => (u.admin, u.email)).result.head)
  }

  def updateUser(userSeq: Seq[PutUserInfo], session: SessionClass): Future[Unit] = {
    val query = (for {
      _ <- DBIO.seq(userSeq.map(r => {
        modules.userQuery.filter(_.id === r.id).map(user => (user.admin, user.name, user.email, user.title, user.update_by, user.update_time)).update(r.admin, r.name, r.email, r.title, session.userId, ResponseUtils.currentTime)
      }): _*)
      _ <- DBIO.seq(userSeq.map(u => {
        modules.relUserGroupQuery.filter(r => r.user_id === u.id && r.create_by === session.userId).delete
      }): _*)
      _ <- {
        val relSeq = for {rel <- userSeq.head.relUG
        } yield RelUserGroup(0, userSeq.head.id, rel.group_id, active = true, currentTime, session.userId, currentTime, session.userId)
        modules.relUserGroupQuery ++= relSeq
      }
    } yield ()).transactionally
    db.run(query)
  }


  def updateLoginUser(loginUser: LoginUserInfo, session: SessionClass): Future[Int] = {
    db.run(modules.userQuery.filter(_.id === session.userId).map(user => (user.name, user.title, user.update_by, user.update_time)).update(loginUser.name, loginUser.title, session.userId, ResponseUtils.currentTime))
  }

  def getAllGroups(userId: Long, session: SessionClass): Future[Seq[PutRelUserGroup]] = {
    val query = modules.relUserGroupQuery.filter(rel => rel.user_id === userId && rel.create_by === session.userId)
      .map(r => (r.id, r.group_id)).result
    db.run(query).mapTo[Seq[PutRelUserGroup]]
  }


  def getUserInfo(session: SessionClass): Future[Seq[QueryUserInfo]] = {
    db.run(modules.userQuery.filter(_.id === session.userId).map(r => (r.id, r.email, r.title, r.name, r.admin) <> (QueryUserInfo.tupled, QueryUserInfo.unapply)).result).
      mapTo[Seq[QueryUserInfo]]
  }


  def deleteUser(userId: Long, session: SessionClass): Future[Unit] = {
    val query = (for {
      _ <- modules.userQuery.filter(u => u.id === userId).delete
      _ <- modules.relUserGroupQuery.filter(rel => rel.user_id === userId).delete
    } yield ()).transactionally
    db.run(query)
  }
}
