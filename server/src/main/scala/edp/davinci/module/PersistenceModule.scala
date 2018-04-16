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


package edp.davinci.module

import edp.davinci.persistence.base.{BaseDal, BaseDalImpl}
import edp.davinci.persistence.entities._
import slick.basic.DatabaseConfig
import slick.jdbc.JdbcProfile
import slick.lifted.TableQuery


object DbModule extends ConfigurationModuleImpl {
  private lazy val dbConfig: DatabaseConfig[JdbcProfile] = DatabaseConfig.forConfig("mysqldb", config)
  //  private val dbConfig: DatabaseConfig[JdbcProfile] = DatabaseConfig.forConfig("h2db")

  lazy val profile: JdbcProfile = dbConfig.profile
  println("profile == " + config.getString("mysqldb.profile"))

  lazy val db: JdbcProfile#Backend#Database = dbConfig.db
  println("db == " + config.getString("mysqldb.db.url"))

}

trait PersistenceModule {
  val groupQuery: TableQuery[GroupTable] = TableQuery[GroupTable]
  val sqlLogQuery: TableQuery[SqlLogTable] = TableQuery[SqlLogTable]
  val sourceQuery: TableQuery[SourceTable] = TableQuery[SourceTable]
  val relDWQuery: TableQuery[RelDashboardWidgetTable] = TableQuery[RelDashboardWidgetTable]
  val userQuery: TableQuery[UserTable] = TableQuery[UserTable]
  val relUserGroupQuery: TableQuery[RelUserGroupTable] = TableQuery[RelUserGroupTable]
  val dashboardQuery: TableQuery[DashboardTable] = TableQuery[DashboardTable]
  val widgetQuery: TableQuery[WidgetTable] = TableQuery[WidgetTable]
  val libWidgetQuery: TableQuery[LibWidgetTable] = TableQuery[LibWidgetTable]
  val viewQuery: TableQuery[ViewTb] = TableQuery[ViewTb]
  val relGroupViewQuery: TableQuery[RelGroupViewTable] = TableQuery[RelGroupViewTable]
  val uploadMetaQuery: TableQuery[MetaTable] = TableQuery[MetaTable]
  val cronJobQuery: TableQuery[CronJobTable] = TableQuery[CronJobTable]


  val groupDal: BaseDal[GroupTable, UserGroup]
  val sqlLogDal: BaseDal[SqlLogTable, SqlLog]
  val sourceDal: BaseDal[SourceTable, Source]
  val userDal: BaseDal[UserTable, User]
  val relUserGroupDal: BaseDal[RelUserGroupTable, RelUserGroup]
  val dashboardDal: BaseDal[DashboardTable, Dashboard]
  val relDashboardWidgetDal: BaseDal[RelDashboardWidgetTable, RelDashboardWidget]
  val widgetDal: BaseDal[WidgetTable, Widget]
  val libWidgetDal: BaseDal[LibWidgetTable, LibWidget]
  val viewDal: BaseDal[ViewTb, View]
  val relGroupViewDal: BaseDal[RelGroupViewTable, RelGroupView]
  val uploadMetaDal: BaseDal[MetaTable, UploadMeta]
  val cronJobDal: BaseDal[CronJobTable, CronJob]
}

trait PersistenceModuleImpl extends PersistenceModule {
  this: ConfigurationModule =>

  override lazy val groupDal = new BaseDalImpl[GroupTable, UserGroup](TableQuery[GroupTable])
  override lazy val sqlLogDal = new BaseDalImpl[SqlLogTable, SqlLog](TableQuery[SqlLogTable])
  override lazy val sourceDal = new BaseDalImpl[SourceTable, Source](TableQuery[SourceTable])
  override lazy val userDal = new BaseDalImpl[UserTable, User](TableQuery[UserTable])
  override lazy val relUserGroupDal = new BaseDalImpl[RelUserGroupTable, RelUserGroup](TableQuery[RelUserGroupTable])
  override lazy val dashboardDal = new BaseDalImpl[DashboardTable, Dashboard](TableQuery[DashboardTable])
  override lazy val relDashboardWidgetDal = new BaseDalImpl[RelDashboardWidgetTable, RelDashboardWidget](TableQuery[RelDashboardWidgetTable])
  override lazy val widgetDal = new BaseDalImpl[WidgetTable, Widget](TableQuery[WidgetTable])
  override lazy val libWidgetDal = new BaseDalImpl[LibWidgetTable, LibWidget](TableQuery[LibWidgetTable])
  override lazy val viewDal = new BaseDalImpl[ViewTb, View](TableQuery[ViewTb])
  override lazy val relGroupViewDal = new BaseDalImpl[RelGroupViewTable, RelGroupView](TableQuery[RelGroupViewTable])
  override lazy val uploadMetaDal = new BaseDalImpl[MetaTable, UploadMeta](TableQuery[MetaTable])
  override lazy val cronJobDal = new BaseDalImpl[CronJobTable, CronJob](TableQuery[CronJobTable])
}
