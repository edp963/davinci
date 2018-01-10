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





package edp.davinci.rest.widget

import edp.davinci.ModuleInstance
import edp.davinci.module.DbModule._
import edp.davinci.persistence.entities._
import edp.davinci.rest.SessionClass
import edp.davinci.util.ResponseUtils
import slick.jdbc.MySQLProfile.api._
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

object WidgetService extends WidgetService

trait WidgetService {
  private lazy val modules = ModuleInstance.getModule

  def getAll(session: SessionClass): Future[Seq[PutWidget]] = {
    val viewIds = if (session.admin)
      modules.viewQuery.filter(view => view.create_by === session.userId ||
        (view.id in modules.relGroupViewQuery.filter(_.group_id inSet session.groupIdList).map(_.flatTable_id).distinct)).map(_.id)
    else modules.relGroupViewQuery.filter(_.group_id inSet session.groupIdList).map(_.flatTable_id).distinct

    if (session.admin)
      db.run(modules.widgetQuery.filter(widget => widget.create_by === session.userId || (widget.flatTable_id in viewIds)).map(w => (w.id, w.widgetlib_id, w.flatTable_id, w.name, w.adhoc_sql, w.desc, w.config, w.chart_params, w.query_params, w.publish, w.create_by) <> (PutWidget.tupled, PutWidget.unapply)).result)
    else {
      val query = modules.widgetQuery.filter(widget => widget.publish && (widget.flatTable_id in viewIds))
        .map(w => (w.id, w.widgetlib_id, w.flatTable_id, w.name, w.adhoc_sql, w.desc, w.config, w.chart_params, w.query_params, w.publish, w.create_by) <> (PutWidget.tupled, PutWidget.unapply)).result
      db.run(query).mapTo[Seq[PutWidget]]
    }
  }

  def getWidgetById(id: Long): Future[Option[PutWidget]] = {
    db.run(modules.widgetQuery.filter(_.id === id).
      map(w => (w.id, w.widgetlib_id, w.flatTable_id, w.name, w.adhoc_sql, w.desc, w.config, w.chart_params, w.query_params, w.publish, w.create_by) <> (PutWidget.tupled, PutWidget.unapply)).result.headOption).
      mapTo[Option[PutWidget]]
  }

  def getViewId(widgetId: Long): Future[(Long, Option[String])] = {
    db.run(modules.widgetQuery.filter(_.id === widgetId).map(w => (w.flatTable_id, w.adhoc_sql)).result.head)
  }

  def update(widgetSeq: Seq[PutWidget], session: SessionClass): Future[Unit] = {
    val query = DBIO.seq(widgetSeq.map(r => {
      modules.widgetQuery.filter(w => w.id === r.id && w.create_by === session.userId).map(w => (w.flatTable_id, w.widgetlib_id, w.name, w.adhoc_sql, w.desc, w.config, w.chart_params, w.query_params, w.publish, w.update_by, w.update_time))
        .update(r.flatTable_id, r.widgetlib_id, r.name, r.adhoc_sql, r.desc, r.config, r.chart_params, r.query_params, r.publish, session.userId, ResponseUtils.currentTime)
    }): _*)
    db.run(query)
  }

  def getSql(widgetId: Long): Future[Seq[(String, String, String)]] = {
    val query = (modules.widgetQuery.filter(obj => obj.id === widgetId) join modules.viewQuery on (_.flatTable_id === _.id))
      .map {
        case (w, b) => (w.adhoc_sql.getOrElse(""), b.sql_tmpl, b.result_table)
      }.result
    db.run(query)
  }


  def deleteWidget(widgetId: Long, session: SessionClass): Future[Unit] = {
    val query = (for {
      _ <- modules.widgetQuery.filter(w => w.id === widgetId && w.create_by === session.userId).delete
      _ <- modules.relDWQuery.filter(rel => rel.widget_id === widgetId && rel.create_by === session.userId).delete
    } yield ()).transactionally
    db.run(query)
  }


}
