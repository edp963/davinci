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





package edp.davinci.util.common

import java.io.ByteArrayOutputStream

import com.github.tototoshi.csv.CSVWriter
import edp.davinci.rest.Paginate
import edp.davinci.util.common.DavinciConstants.defaultEncode

object FileUtils extends FileUtils

trait FileUtils {
  val dir: String = System.getenv("DAVINCI_HOME")

  def covert2CSV(row: Seq[String]): String = {
    val byteArrOS = new ByteArrayOutputStream()
    val writer = CSVWriter.open(byteArrOS)
    writer.writeRow(row)
    val CSVStr = byteArrOS.toString(defaultEncode)
    byteArrOS.close()
    writer.close()
    CSVStr
  }

  def getPageInfo(paginate: Paginate): String = {
    if (null != paginate) {
      val (limit, offset, sortBy) = (paginate.limit, paginate.offset, paginate.sortBy)
      val paginationInfo = if (limit != -1)
        if (offset != -1)
          s"limit $limit offset $offset"
        else s"limit $limit"
      else ""
      val sortInfo = if (sortBy != "") "ORDER BY " + sortBy.map(ch => if (ch == ':') ' ' else ch) else ""
      Set(sortInfo, paginationInfo).mkString(" ")
    } else ""
  }


  def printToFile(f: java.io.File)(op: java.io.PrintWriter => Unit) {
    val p = new java.io.PrintWriter(f, "UTF-8")
    try {
      op(p)
    } finally {
      p.close()
    }
    f.toPath.toString
  }

}

