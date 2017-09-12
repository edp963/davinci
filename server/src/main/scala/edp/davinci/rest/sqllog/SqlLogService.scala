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

package edp.davinci.rest.sqllog

import edp.davinci.module.DbModule._
import edp.davinci.ModuleInstance
import edp.davinci.persistence.entities.SqlLog
import edp.davinci.rest.SessionClass
import slick.jdbc.MySQLProfile.api._
import scala.concurrent.Future

object SqlLogService extends SqlLogService

trait SqlLogService {
  private lazy val modules = ModuleInstance.getModule

  def getAll(session: SessionClass): Future[Seq[SqlLog]] = {
    db.run(modules.sqlLogQuery.filter(_.user_id === session.userId).result).mapTo[Seq[SqlLog]]
  }

  def update(sqlLogSeq: Seq[SqlLog], session: SessionClass): Future[Unit] = {
    val query = DBIO.seq(sqlLogSeq.map(r => {
      modules.sqlLogQuery.filter(_.id === r.id).map(log => (log.id, log.user_id, log.user_email, log.sql, log.start_time, log.end_time, log.success, log.error))
        .update(r.id, r.user_id, r.user_email, r.sql, r.start_time, r.end_time, r.success, r.error)
    }): _*)
    db.run(query)
  }
}
