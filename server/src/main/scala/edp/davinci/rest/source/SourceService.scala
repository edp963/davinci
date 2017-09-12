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

package edp.davinci.rest.source

import edp.davinci.ModuleInstance
import edp.davinci.module.DbModule._
import edp.davinci.persistence.entities.PutSourceInfo
import edp.davinci.rest.SessionClass
import edp.davinci.util.ResponseUtils
import slick.jdbc.MySQLProfile.api._
import scala.concurrent.Future

object SourceService extends SourceService

trait SourceService {
  private lazy val modules = ModuleInstance.getModule

  def getAll: Future[Seq[(Long, String, String, String, String, String)]] = {
    db.run(modules.sourceQuery.map(r => (r.id, r.name, r.connection_url, r.desc, r.`type`, r.config)).result)
  }

  def update(sourceSeq: Seq[PutSourceInfo], session: SessionClass): Future[Unit] = {
    val query = DBIO.seq(sourceSeq.map(r => {
      modules.sourceQuery.filter(_.id === r.id).map(source => (source.name, source.connection_url, source.desc, source.`type`, source.config, source.update_by, source.update_time))
        .update(r.name, r.connection_url, r.desc, r.`type`, r.config, session.userId, ResponseUtils.currentTime)
    }): _*)
    db.run(query)
  }

  def deleteSource(sourceId: Long): Future[Int] = {
    modules.sourceDal.deleteById(sourceId)
  }

  def updateView(sourceId: Long): Future[Int] = {
    db.run(modules.viewQuery.filter(_.source_id === sourceId).map(_.source_id).update(0))
  }
}
