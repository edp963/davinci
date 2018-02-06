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





package edp.davinci.rest.group

import edp.davinci.ModuleInstance
import edp.davinci.module.DbModule._
import edp.davinci.persistence.entities.{Group4Put, UserGroup}
import edp.davinci.rest.SessionClass
import edp.davinci.util.common.ResponseUtils
import slick.jdbc.MySQLProfile.api._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

object GroupService extends GroupService

trait GroupService {
  private lazy val modules = ModuleInstance.getModule

  def getGroups(session: SessionClass): Future[Seq[Group4Put]] = {
    db.run(modules.groupQuery.filter(_.create_by === session.userId).sortBy(_.update_time.desc).map(r => (r.id, r.name, r.desc) <> (Group4Put.tupled, Group4Put.unapply)).result).
      mapTo[Seq[Group4Put]]
  }

  def update(groupSeq: Seq[Group4Put], session: SessionClass): Future[Unit] = {
    val query = DBIO.seq(groupSeq.map(r => {
      modules.groupQuery.filter(g => g.id === r.id && g.create_by === session.userId).map(group => (group.name, group.desc, group.update_by, group.update_time)).update(r.name, r.desc, session.userId, ResponseUtils.currentTime)
    }): _*)
    db.run(query)
  }

  def deleteGroup(groupId: Long, session: SessionClass): Future[Unit] = {
    val query = (for {
      _ <- modules.groupQuery.filter(g => g.id === groupId && g.create_by === session.userId).delete
      _ <- modules.relGroupViewQuery.filter(rel => rel.group_id === groupId && rel.create_by === session.userId).delete
      _ <- modules.relUserGroupQuery.filter(rel => rel.group_id === groupId && rel.create_by === session.userId).delete
    } yield ()).transactionally
    db.run(query)
  }

}
