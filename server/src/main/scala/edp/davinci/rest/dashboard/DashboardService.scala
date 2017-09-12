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
import edp.davinci.util.ResponseUtils
import slick.jdbc.MySQLProfile.api._

import scala.concurrent.Future

object DashboardService extends DashboardService

trait DashboardService {
  private lazy val modules = ModuleInstance.getModule

  def getInsideInfo(session: SessionClass, dashboardId: Long): Future[Seq[(Long, Long, Long, Int, Int, Int, Int, String, String)]] = {
    val query = if (session.admin)
      (modules.relDWQuery.filter(obj => obj.dashboard_id === dashboardId) join modules.widgetQuery on (_.widget_id === _.id)).
        map {
          case (r, w) => (r.id, w.id, w.flatTable_id, r.position_x, r.position_y, r.width, r.length, r.trigger_type, r.trigger_params)
        }.result
    else {
      val flatIds = modules.relGroupViewQuery.filter(_.group_id inSet session.groupIdList).map(_.flatTable_id)
      (modules.relDWQuery.filter(obj => obj.dashboard_id === dashboardId) join
        modules.widgetQuery.filter(_.publish).filter(_.flatTable_id in flatIds) on (_.widget_id === _.id))
        .map {
          case (rDW, w) => (rDW.id, w.id, w.flatTable_id, rDW.position_x, rDW.position_y, rDW.width, rDW.length, rDW.trigger_type, rDW.trigger_params)
        }.result
    }
    db.run(query)
  }

  def getDashBoard(dashboardId: Long): Future[Option[(Long, String, Option[String], String, Boolean)]] = {
    val query = modules.dashboardQuery.filter(_.id === dashboardId).map(d => (d.id, d.name, d.pic, d.desc, d.publish)).result
    db.run(query.headOption)
  }


  def getDashboardInsideInfo(dashboardId: Long, groupIds: Seq[Long], admin: Boolean): Future[Seq[(Long, Long, Long, Int, Int, Int, Int, String, String)]] = {
    val query = if (admin)
      (modules.relDWQuery.filter(obj => obj.dashboard_id === dashboardId) join modules.widgetQuery on (_.widget_id === _.id)).
        map {
          case (r, w) => (r.id, w.id, w.flatTable_id, r.position_x, r.position_y, r.width, r.length, r.trigger_type, r.trigger_params)
        }.result
    else {
      val flatIds = modules.relGroupViewQuery.filter(_.group_id inSet groupIds).map(_.flatTable_id)
      (modules.relDWQuery.filter(obj => obj.dashboard_id === dashboardId) join
        modules.widgetQuery.filter(_.publish).filter(_.flatTable_id in flatIds) on (_.widget_id === _.id))
        .map {
          case (rDW, w) => (rDW.id, w.id, w.flatTable_id, rDW.position_x, rDW.position_y, rDW.width, rDW.length, rDW.trigger_type, rDW.trigger_params)
        }.result
    }
    db.run(query)
  }

  def update(session: SessionClass, dashboardSeq: Seq[PutDashboardInfo]): Future[Unit] = {
    val query = DBIO.seq(dashboardSeq.map(r => {
      modules.dashboardQuery.filter(obj => obj.id === r.id).map(dashboard => (dashboard.name, dashboard.desc, dashboard.publish, dashboard.update_by, dashboard.update_time)).update(r.name, r.desc, r.publish, session.userId, ResponseUtils.currentTime)
    }): _*)
    db.run(query)
  }

  def updateRelDashboardWidget(session: SessionClass, relSeq: Seq[PutRelDashboardWidget]): Future[Unit] = {
    val query = DBIO.seq(relSeq.map(r => {
      modules.relDWQuery.filter(obj => obj.id === r.id).map(rel => (rel.dashboard_id, rel.widget_id, rel.position_x, rel.position_y, rel.width, rel.length, rel.trigger_type, rel.trigger_params, rel.update_by, rel.update_time))
        .update(r.dashboard_id, r.widget_id, r.position_x, r.position_y, r.width, r.length, r.trigger_type, r.trigger_params, session.userId, ResponseUtils.currentTime)
    }): _*)
    db.run(query)
  }

  def getAll(session: SessionClass): Future[Seq[(Long, String, Option[String], String, Boolean)]] = {
    val query =
      if (session.admin)
        modules.dashboardQuery.map(obj => (obj.id, obj.name, obj.pic, obj.desc, obj.publish)).result
      else modules.dashboardQuery.filter(obj => obj.publish).map(obj => (obj.id, obj.name, obj.pic, obj.desc, obj.publish)).result
    db.run(query)
  }

  def deleteRelDWById(relId: Long): Future[Int] =
    modules.relDashboardWidgetDal.deleteById(relId)

  def deleteDashboard(dashboardId: Long): Future[Int] =
    modules.dashboardDal.deleteById(dashboardId)

  def deleteRelByFilter(dashboardId: Long): Future[Int] =
    modules.relDashboardWidgetDal.deleteByFilter(_.dashboard_id === dashboardId)
}
