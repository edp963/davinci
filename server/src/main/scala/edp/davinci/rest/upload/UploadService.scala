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





package edp.davinci.rest.upload

import edp.davinci.ModuleInstance
import edp.davinci.module.DbModule._
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import edp.davinci.util.ResponseUtils
import slick.jdbc.MySQLProfile.api._

import scala.concurrent.Future

object UploadService extends UploadService

trait UploadService {
  lazy val modules = ModuleInstance.getModule

  def getUploadMeta(metaId: Long): Future[Option[PostUploadMeta]] = {
    val query = modules.uploadMetaQuery.filter(_.id === metaId).map(m => (m.table_name,m.source_id, m.primary_keys, m.index_keys, m.replace_mode) <>
      (PostUploadMeta.tupled, PostUploadMeta.unapply)).result.headOption
    db.run(query).mapTo[Option[PostUploadMeta]]

  }

}
