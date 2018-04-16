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


package edp.davinci.util.common

import akka.http.scaladsl.model.{ContentTypes, HttpCharsets, MediaTypes}
import edp.davinci.module.ConfigurationModuleImpl

object DavinciConstants extends DavinciConstants with SeparatorConstants with ContentType with Timeout


trait DavinciConstants {
  lazy val flatTable = "flattable"
  lazy val defaultEncode = "UTF-8"
  lazy val groupVar = "group@var"
  lazy val queryVar = "query@var"
  lazy val updateVar = "update@var"
  lazy val uploadDir = "tempUploads"
  lazy val downloadDir = "tempFiles"
}


trait SeparatorConstants {
  lazy val conditionSeparator = ","
  lazy val sqlSeparator = ";"
  lazy val sqlUrlSeparator = "&"
  lazy val CSVHeaderSeparator = ':'
  lazy val delimiterStartChar = '<'
  lazy val delimiterEndChar = '>'
  lazy val assignmentChar = '='
  lazy val dollarDelimiter = '$'
  lazy val STStartChar = '{'
  lazy val STEndChar = '}'
}

trait ContentType {
  lazy val textHtml = MediaTypes.`text/html` withCharset HttpCharsets.`UTF-8`
  lazy val textCSV = MediaTypes.`text/csv` withCharset HttpCharsets.`UTF-8`
  lazy val appJson = ContentTypes.`application/json`
}


trait Timeout {
  private lazy val timeoutStr = ConfigurationModuleImpl.config.getString("akka.http.server.request-timeout ")
  lazy val requestTimeout = timeoutStr.substring(0, timeoutStr.lastIndexOf("s")).trim.toLong
}

object OpType extends Enumeration {
  type OpType = Value

  lazy val INSERT = Value("insert")
  lazy val UPDATE = Value("update")
  lazy val DELETE = Value("delete")

  def opType(s: String) = OpType.withName(s.toLowerCase)
}

object LoadMode extends Enumeration {

  lazy val APPEND = 0
  lazy val REPLACE = 1
  lazy val MERGE = 2

}

object PermissionType {
  lazy val DOWNLOAD = "download"
  lazy val SHARE = "share"
  lazy val QUERY = "query"
}




