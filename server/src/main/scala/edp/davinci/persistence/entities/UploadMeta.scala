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

import edp.davinci.persistence.base.{BaseEntity, BaseTable}
import slick.jdbc.MySQLProfile.api._

case class UploadMeta(id: Long,
                      source_id: Long,
                      table_name: String,
                      file_name: Option[String] = None,
                      primary_keys: Option[String] = None,
                      index_keys: Option[String] = None,
                      replace_mode: Int,
                      status: Boolean,
                      create_time: String,
                      create_by: Long) extends BaseEntity

case class PostUploadMeta(table_name: String,
                          source_id: Long,
                          primary_keys: Option[String] = None,
                          index_keys: Option[String] = None,
                          replace_mode: Int = 1)


class MetaTable(tag: Tag) extends BaseTable[UploadMeta](tag, "upload_meta") {
  //  def domain_id = column[Long]("domain_id")

  def table_name = column[String]("table_name")

  def file_name = column[Option[String]]("file_name")

  def source_id = column[Long]("source_id")

  def primary_keys = column[Option[String]]("primary_keys")

  def index_keys = column[Option[String]]("indexes")

  def replace_mode = column[Int]("replace_mode")

  def status = column[Boolean]("status")

  def create_time = column[String]("create_time")

  def create_by = column[Long]("create_by")


  def * = (id, source_id, table_name, file_name, primary_keys, index_keys, replace_mode, status, create_time, create_by) <> (UploadMeta.tupled, UploadMeta.unapply)
}
