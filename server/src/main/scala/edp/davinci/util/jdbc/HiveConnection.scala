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

package edp.davinci.util.jdbc

import java.sql.{Connection, DriverManager}

import org.apache.log4j.Logger

object HiveConnection {
  private lazy val logger = Logger.getLogger(this.getClass)

  def getConnection(jdbcUrl: String, user: String, password: String): Connection = {
    try {
      Class.forName("org.apache.hive.jdbc.HiveDriver")
    } catch {
      case e:Throwable =>
        logger.error("hive connection", e)
    }
    DriverManager.getConnection(jdbcUrl, user, password)
  }

}
