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

package edp.davinci.rest.view

import edp.davinci.ModuleInstance
import edp.davinci.module.DbModule._
import edp.davinci.persistence.entities._
import edp.davinci.rest.SessionClass
import edp.davinci.util.ResponseUtils
import slick.jdbc.MySQLProfile.api._
import scala.concurrent.Future

object ViewService extends ViewService

trait ViewService {
  private lazy val modules = ModuleInstance.getModule

  def getAllViews: Future[Seq[(Long, Long, String, String, Option[String], String, String, String, String)]] = {
    db.run(modules.viewQuery.map(r => (r.id, r.source_id, r.name, r.sql_tmpl, r.desc, r.trigger_type, r.frequency, r.`catch`, r.result_table)).result)
  }

  def updateFlatTbl(flatTableSeq: Seq[PutViewInfo], session: SessionClass): Future[Unit] = {
    val query = DBIO.seq(flatTableSeq.map(r => {
      modules.viewQuery.filter(obj => obj.id === r.id).map(flatTable => (flatTable.name, flatTable.source_id, flatTable.sql_tmpl, flatTable.desc, flatTable.trigger_type, flatTable.frequency, flatTable.`catch`, flatTable.update_by, flatTable.update_time))
        .update(r.name, r.source_id, r.sql_tmpl, Some(r.desc), r.trigger_type, r.frequency, r.`catch`, session.userId, ResponseUtils.currentTime)
    }): _*)
    db.run(query)
  }

  def deleteFromView(idSeq: Seq[Long]): Future[Int] = {
    modules.viewDal.deleteById(idSeq)
  }

  def deleteFromRel(viewId: Long): Future[Int] = {
    modules.relGroupViewDal.deleteByFilter(_.flatTable_id === viewId)
  }

  def getGroups(flatId: Long): Future[Seq[(Long, Long, String)]] = {
    db.run(modules.relGroupViewQuery.filter(_.flatTable_id === flatId).map(rel => (rel.id, rel.group_id, rel.sql_params)).result)
  }

  def updateWidget(flatTableId: Long): Future[Int] = {
    db.run(modules.widgetQuery.filter(_.flatTable_id === flatTableId).map(_.flatTable_id).update(0))
  }

  def getSourceInfo(flatTableId: Long, session: SessionClass = null): Future[Seq[(String, String, String, String)]] = {
    val rel = if (session.admin) modules.relGroupViewQuery.filter(_.flatTable_id === flatTableId) else modules.relGroupViewQuery.filter(_.flatTable_id === flatTableId).filter(_.group_id inSet session.groupIdList)
    val query = (rel join modules.viewQuery.filter(obj => obj.id === flatTableId) on (_.flatTable_id === _.id) join
      modules.sourceQuery on (_._2.source_id === _.id))
      .map {
        case (rf, s) => (rf._2.sql_tmpl, rf._2.result_table, s.connection_url, rf._1.sql_params)
      }.result
    db.run(query)
  }

  def getSqlInfo(flatTableId: Long, groupIds: Seq[Long], admin: Boolean): Future[Seq[(String, String, String, String)]] = {
    val rel = if (admin) modules.relGroupViewQuery.filter(_.flatTable_id === flatTableId) else modules.relGroupViewQuery.filter(_.flatTable_id === flatTableId).filter(_.group_id inSet groupIds)
    val query = (rel join modules.viewQuery.filter(obj => obj.id === flatTableId) on (_.flatTable_id === _.id) join
      modules.sourceQuery on (_._2.source_id === _.id))
      .map {
        case (rf, s) => (rf._2.sql_tmpl, rf._2.result_table, s.connection_url, rf._1.sql_params)
      }.result
    db.run(query)
  }


}
