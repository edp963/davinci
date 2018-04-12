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





package edp.davinci.util.jdbc

import java.sql.Connection
import java.util.Properties
import javax.sql.DataSource

import com.alibaba.druid.pool.{DruidDataSource, ElasticSearchDruidDataSourceFactory}
import org.apache.log4j.Logger

import scala.collection.mutable

object ESConnection extends ESConnection

trait ESConnection {

  lazy val dataSourceMap: mutable.HashMap[(String, String), DataSource] = new mutable.HashMap[(String, String), DataSource]
  private lazy val logger = Logger.getLogger(this.getClass)


  def getESJDBCConnection(jdbcUrl: String, username: String): Connection = {
    val tmpJdbcUrl = jdbcUrl.toLowerCase
    if (!dataSourceMap.contains((tmpJdbcUrl, username)) || dataSourceMap((tmpJdbcUrl, username)) == null) {
      synchronized {
        if (!dataSourceMap.contains((tmpJdbcUrl, username)) || dataSourceMap((tmpJdbcUrl, username)) == null) {
          getDataSource(tmpJdbcUrl, username)
        }
      }
    }
    dataSourceMap((tmpJdbcUrl, username)).getConnection
  }

  private def getDataSource(url: String, username: String) = {
    val properties = new Properties
    properties.put("url", url)
    val dds = ElasticSearchDruidDataSourceFactory.createDataSource(properties).asInstanceOf[DruidDataSource]
    dataSourceMap((url, username)) = dds
  }


}
