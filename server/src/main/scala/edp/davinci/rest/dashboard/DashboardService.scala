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


package edp.davinci.rest.dashboard

import edp.davinci.ModuleInstance
import edp.davinci.module.DbModule._
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import edp.davinci.rest.shares.ShareRouteHelper
import edp.davinci.util.common.ResponseUtils
import slick.jdbc.MySQLProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object DashboardService extends DashboardService

trait DashboardService {
  private lazy val modules = ModuleInstance.getModule

  def getRelation(session: SessionClass, dashboardId: Long): Future[Seq[WidgetLayout]] = {
    val viewIds = modules.relGroupViewQuery.filter(_.group_id inSet session.groupIdList).map(_.flatTable_id).distinct
    val widgetIds = if (session.admin) modules.widgetQuery.filter(_.publish).filter(_.flatTable_id in viewIds).map(_.id)
    else modules.widgetQuery.filter(_.publish).filter(_.flatTable_id in viewIds).map(_.id)

    val query = if (session.admin)
      (modules.relDWQuery.filter(obj => obj.dashboard_id === dashboardId && ((obj.create_by === session.userId) || (obj.widget_id in widgetIds))) join modules.widgetQuery on (_.widget_id === _.id)).
        map {
          case (r, w) =>
            (r.id, w.id, w.flatTable_id, r.position_x, r.position_y, r.width, r.length, r.trigger_type, r.trigger_params, "", w.create_by)
        }.result
    else {
      (modules.relDWQuery.filter(obj => obj.dashboard_id === dashboardId) join
        modules.widgetQuery.filter(_.publish).filter(_.flatTable_id in viewIds) on (_.widget_id === _.id))
        .map {
          case (rDW, w) => (rDW.id, w.id, w.flatTable_id, rDW.position_x, rDW.position_y, rDW.width, rDW.length, rDW.trigger_type, rDW.trigger_params, "", w.create_by)
        }.result
    }
    val map = db.run(query).map(_.map(s => {
      val permission = ShareRouteHelper.getUserPermission(s._2, session.userId)
      WidgetLayout(s._1, s._2, s._3, s._4, s._5, s._6, s._7, s._8, s._9, s._10, s._11, permission)
    }))
    map
  }

  def getPermission(widgetId: Long): Future[Seq[String]] = {
    val query = (modules.widgetQuery.filter(_.id === widgetId) join modules.relGroupViewQuery on (_.flatTable_id === _.flatTable_id)).map(_._2.config).result
    db.run(query)
  }

  def getDashBoard(dashboardId: Long): Future[Option[PutDashboard]] = {
    val query = modules.dashboardQuery.filter(_.id === dashboardId).map(d => (d.id, d.name, d.pic, d.desc, d.linkage_detail, d.config, d.publish, d.active, d.create_by) <> (PutDashboard.tupled, PutDashboard.unapply)).result
    db.run(query.headOption).mapTo[Option[PutDashboard]]
  }


  def update(session: SessionClass, dashboardSeq: Seq[PutDashboard]): Future[Unit] = {
    val query = DBIO.seq(dashboardSeq.map(r => {
      modules.dashboardQuery.filter(obj => obj.id === r.id && obj.create_by === session.userId).map(dashboard => (dashboard.name, dashboard.desc, dashboard.linkage_detail, dashboard.config, dashboard.publish, dashboard.update_by, dashboard.update_time))
        .update(r.name, r.desc, r.linkage_detail, r.config, r.publish, session.userId, ResponseUtils.currentTime)
    }): _*)
    db.run(query)
  }

  def updateRelation(session: SessionClass, relSeq: Seq[PutRelDashboardWidget]): Future[Unit] = {
    val query = DBIO.seq(relSeq.map(r => {
      modules.relDWQuery.filter(obj => obj.id === r.id && obj.create_by === session.userId).map(rel => (rel.dashboard_id, rel.widget_id, rel.position_x, rel.position_y, rel.width, rel.length, rel.trigger_type, rel.trigger_params, rel.update_by, rel.update_time))
        .update(r.dashboard_id, r.widget_id, r.position_x, r.position_y, r.width, r.length, r.trigger_type, r.trigger_params, session.userId, ResponseUtils.currentTime)
    }): _*)
    db.run(query)
  }

  def getAll(session: SessionClass): Future[Seq[PutDashboard]] = {
    val flatIds = modules.relGroupViewQuery.filter(_.group_id inSet session.groupIdList).map(_.flatTable_id).distinct
    val widgetIds = if (session.admin) modules.widgetQuery.filter(_.flatTable_id in flatIds).map(_.id)
    else modules.widgetQuery.filter(_.publish).filter(_.flatTable_id in flatIds).map(_.id)
    val allPublishDash = modules.dashboardQuery.filter(_.publish).map(_.id)

    val dashboardIds = if (session.admin) {
      modules.dashboardQuery.filter(_.create_by === session.userId).map(_.id) ++
        modules.relDWQuery.filter(r => (r.widget_id in widgetIds) && (r.dashboard_id in allPublishDash)).map(_.dashboard_id).distinct
    }
    else modules.relDWQuery.filter(_.widget_id in widgetIds).map(_.dashboard_id).distinct

    val query = (if (session.admin) modules.dashboardQuery.filter(_.id in dashboardIds)
    else modules.dashboardQuery.filter(d => d.publish && (d.id in dashboardIds))
      ).sortBy(_.update_time.desc).map(d => (d.id, d.name, d.pic, d.desc, d.linkage_detail, d.config, d.publish, d.active, d.create_by) <> (PutDashboard.tupled, PutDashboard.unapply)).result
    db.run(query).mapTo[Seq[PutDashboard]]
  }


  def nameCheck(name: String): Future[Seq[Dashboard]] = {
    db.run(modules.dashboardQuery.filter(_.name === name).result)
  }

  def deleteRelation(relId: Long, session: SessionClass): Future[Int] =
    db.run(modules.relDWQuery.filter(rel => rel.create_by === session.userId && rel.id === relId).delete)


  def deleteDashboard(dashboardId: Long, session: SessionClass): Future[Unit] = {
    val query = (for {
      _ <- modules.dashboardQuery.filter(d => d.id === dashboardId && d.create_by === session.userId).delete
      _ <- modules.relDWQuery.filter(d => d.dashboard_id === dashboardId && d.create_by === session.userId).delete
    } yield ()).transactionally
    db.run(query)
  }

}
