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

package edp.davinci.persistence.entities

import edp.davinci.persistence.base.{BaseEntity, BaseTable, SimpleBaseEntity}
import slick.jdbc.H2Profile.api._

case class RelDashboardWidget(id: Long,
                              dashboard_id: Long,
                              widget_id: Long,
                              position_x: Int,
                              position_y: Int,
                              length: Int,
                              width: Int,
                              trigger_type: String,
                              trigger_params: String,
                              active: Boolean,
                              create_time: String,
                              create_by: Long,
                              update_time: String,
                              update_by: Long) extends BaseEntity


case class PostRelDashboardWidget(dashboard_id: Long,
                                  widget_id: Long,
                                  position_x: Int,
                                  position_y: Int,
                                  length: Int,
                                  width: Int,
                                  trigger_type: String,
                                  trigger_params: String) extends SimpleBaseEntity

case class PutRelDashboardWidget(id: Long,
                                 dashboard_id: Long,
                                 widget_id: Long,
                                 position_x: Int,
                                 position_y: Int,
                                 length: Int,
                                 width: Int,
                                 trigger_type: String,
                                 trigger_params: String)


class RelDashboardWidgetTable(tag: Tag) extends BaseTable[RelDashboardWidget](tag, "rel_dashboard_widget") {
  def dashboard_id = column[Long]("dashboard_id")

  def widget_id = column[Long]("widget_id")

  def position_x = column[Int]("position_x")

  def position_y = column[Int]("position_y")

  def length = column[Int]("length")

  def width = column[Int]("width")

  def trigger_type: Rep[String] = column[String]("trigger_type")

  def trigger_params: Rep[String] = column[String]("trigger_params")

  def create_time = column[String]("create_time")

  def create_by = column[Long]("create_by")

  def update_time = column[String]("update_time")

  def update_by = column[Long]("update_by")

  def * = (id, dashboard_id, widget_id, position_x, position_y, length, width, trigger_type, trigger_params, active, create_time, create_by, update_time, update_by) <> (RelDashboardWidget.tupled, RelDashboardWidget.unapply)
}
