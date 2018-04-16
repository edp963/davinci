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





package davinci

import java.util.regex.Pattern

import edp.davinci.ModuleInstance
import edp.davinci.persistence.entities.PostUploadMeta
import edp.davinci.util.sql.SqlUtils
import org.scalatest.FunSuite

import scala.collection.mutable

class SQLTest extends FunSuite {


  test("insert sql") {
    val timeoutStr = ModuleInstance.getModule.config.getString("akka.http.server.request-timeout ")
    val requestTimeout = timeoutStr.substring(0, timeoutStr.lastIndexOf("s")).trim.toLong
    println(requestTimeout)
    val schemaMap = mutable.HashMap("a" -> "varchar(100)", "b" -> "int")
    val uploadInfo = PostUploadMeta("upload", 114)

    val fieldNames = schemaMap.keySet.toList
    println(SqlUtils.getInsertSql(fieldNames, uploadInfo.table_name))
  }


  test("filter") {
    val sqlString =
      """
        |
        |-- sdfja;faf;lffklf
        |/*
        |djflaksfs
        |nkasfkngasfn
        |nksfskjgjkfgds
        |*/
        |
        |set @a =curdate();
        |select * from dashboard;
      """.stripMargin
    val p = Pattern.compile("(?ms)('(?:''|[^'])*')|--.*?$|/\\*.*?\\*/")
    val result = p.matcher(sqlString).replaceAll("$1")
    println(result)
  }

}
