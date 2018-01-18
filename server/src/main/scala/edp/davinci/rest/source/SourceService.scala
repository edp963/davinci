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
import edp.davinci.persistence.entities.Source4Put
import edp.davinci.rest.SessionClass
import edp.davinci.util.common.ResponseUtils
import slick.jdbc.MySQLProfile.api._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

object SourceService extends SourceService

trait SourceService {
  private lazy val modules = ModuleInstance.getModule

  def getAll(session: SessionClass): Future[Seq[Source4Put]] = {
    db.run(modules.sourceQuery.filter(_.create_by === session.userId).map(r => (r.id, r.name, r.connection_url, r.desc, r.`type`, r.config) <> (Source4Put.tupled, Source4Put.unapply)).result).
      mapTo[Seq[Source4Put]]
  }

  def getById(id: Long): Future[Option[Source4Put]] = {
    db.run(modules.sourceQuery.filter(s => s.id === id).
      map(r => (r.id, r.name, r.connection_url, r.desc, r.`type`, r.config) <> (Source4Put.tupled, Source4Put.unapply)).result.headOption).
      mapTo[Option[Source4Put]]
  }

  def update(sourceSeq: Seq[Source4Put], session: SessionClass): Future[Unit] = {
    val query = DBIO.seq(sourceSeq.map(r => {
      modules.sourceQuery.filter(s => s.id === r.id && s.create_by === session.userId).map(source => (source.name, source.connection_url, source.desc, source.`type`, source.config, source.update_by, source.update_time))
        .update(r.name, r.connection_url, r.desc, r.`type`, r.config, session.userId, ResponseUtils.currentTime)
    }): _*)
    db.run(query)
  }

  def deleteSource(sourceId: Long, session: SessionClass): Future[Unit] = {
    val query = (for {
      _ <- modules.sourceQuery.filter(s => s.id === sourceId && s.create_by === session.userId).delete
      _ <- modules.viewQuery.filter(v => v.source_id === sourceId && v.create_by === session.userId).map(_.source_id).update(0)
    } yield ()).transactionally
    db.run(query)
  }

}
