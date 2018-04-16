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


package edp.davinci.rest.view

import edp.davinci.ModuleInstance
import edp.davinci.module.DbModule._
import edp.davinci.persistence.entities._
import edp.davinci.rest.SessionClass
import edp.davinci.util.common.ResponseUtils
import slick.jdbc.MySQLProfile.api._
import scala.language.postfixOps
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object ViewService extends ViewService

trait ViewService {
  private lazy val modules = ModuleInstance.getModule

  def getAllViews(session: SessionClass): Future[Seq[QueryView]] = {
    val viewIds = modules.relGroupViewQuery.filter(_.group_id inSet session.groupIdList).map(_.flatTable_id).distinct
    db.run(modules.viewQuery.filter(view => (view.create_by === session.userId) || (view.id in viewIds)).sortBy(_.update_time.desc).
      map(r => (r.id, r.source_id, r.name, r.sql_tmpl, r.update_sql, r.desc, r.trigger_type, r.frequency, r.`catch`, r.result_table, r.active, r.create_by) <> (QueryView.tupled, QueryView.unapply)).result).
      mapTo[Seq[QueryView]]
  }

  def updateView(viewSeq: Seq[View4Put], session: SessionClass): Future[Unit] = {
    val query = for {
      _ <- DBIO.seq(viewSeq.map(r => {
        modules.viewQuery.filter(obj => obj.id === r.id && obj.create_by === session.userId).map(view => (view.name, view.source_id, view.sql_tmpl, view.update_sql, view.desc, view.trigger_type, view.frequency, view.`catch`, view.update_by, view.update_time))
          .update(r.name, r.source_id, r.sql_tmpl, r.update_sql, Some(r.desc), r.trigger_type, r.frequency, r.`catch`, session.userId, ResponseUtils.currentTime)
      }): _*)
      _ <- modules.relGroupViewQuery.filter(view => (view.flatTable_id inSet viewSeq.map(_.id)) && view.create_by === session.userId).delete

    } yield ()
    db.run(query)
  }

  def deleteFromView(idSeq: Seq[Long], session: SessionClass): Future[Int] = {
    modules.viewDal.deleteByFilter(view => (view.id inSet session.groupIdList) && (view.create_by === session.userId))
  }


  def deleteView(viewId: Long, session: SessionClass): Future[Unit] = {
    val query = (for {
      _ <- modules.viewQuery.filter(_.id === viewId).delete
      _ <- modules.relGroupViewQuery.filter(view => (view.flatTable_id === viewId) && view.create_by === session.userId).delete
      _ <- modules.widgetQuery.filter(widget => widget.flatTable_id === viewId && widget.create_by === session.userId).map(_.flatTable_id).update(0)
    } yield ()).transactionally
    db.run(query)
  }


  def getGroupViewRelation(flatId: Long): Future[Seq[(Long, Long, String, String)]] = {
    db.run(modules.relGroupViewQuery.filter(_.flatTable_id === flatId).map(rel => (rel.id, rel.group_id, rel.sql_params.get,rel.config)).result)
  }

  def getSource(flatTableId: Long, session: SessionClass = null): Future[Seq[Config4QuerySql]] = {
    val rel = if (session.admin)
      modules.relGroupViewQuery.filter(rel => rel.flatTable_id === flatTableId && (rel.create_by === session.userId || (rel.group_id inSet session.groupIdList)))
    else modules.relGroupViewQuery.filter(_.flatTable_id === flatTableId).filter(_.group_id inSet session.groupIdList)

    val query = for {
      ((rel, view), source) <- rel joinRight modules.viewQuery.filter(obj => obj.id === flatTableId) on (_.flatTable_id === _.id) join
        modules.sourceQuery on (_._2.source_id === _.id)
    } yield (view.name, view.sql_tmpl, view.result_table, source.connection_url, rel.map(_.sql_params)) <> (Config4QuerySql.tupled, Config4QuerySql.unapply)

    db.run(query.result)
  }

  def getUpdateSource(flatTableId: Long, session: SessionClass = null): Future[Seq[Config4UpdateSql]] = {
    val rel = if (session.admin)
      modules.relGroupViewQuery.filter(rel => rel.flatTable_id === flatTableId && (rel.create_by === session.userId || (rel.group_id inSet session.groupIdList)))
    else modules.relGroupViewQuery.filter(_.flatTable_id === flatTableId).filter(_.group_id inSet session.groupIdList)

    val query = for {
      ((rel, view), source) <- rel joinRight modules.viewQuery.filter(obj => obj.id === flatTableId) on (_.flatTable_id === _.id) join
        modules.sourceQuery on (_._2.source_id === _.id)
    } yield (view.name, view.update_sql, view.result_table, source.connection_url, rel.map(_.sql_params)) <> (Config4UpdateSql.tupled, Config4UpdateSql.unapply)
    db.run(query.result)
  }


}
