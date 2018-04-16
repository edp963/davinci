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

import com.github.tototoshi.csv.CSVReader
import edp.davinci.util.common.DavinciConstants._
import org.apache.log4j.Logger
import org.clapper.scalasti.{Constants, STGroupFile}
import org.stringtemplate.v4.{ST, STGroupString}

import scala.collection.mutable
import scala.io.Source

object STRender extends STRender

trait STRender {
  private lazy val logger = Logger.getLogger(this.getClass)

  def getHTML(resultList: Seq[String], stgPath: String = "stg/tmpl.stg"): String = {
    val listBuffer: mutable.Buffer[List[String]] = covert2ListBuf(resultList)
    val noNullResult = nullValue2EmptyString(listBuffer)
    val tables = Seq(noNullResult)
    STGroupFile(stgPath, Constants.DefaultEncoding, dollarDelimiter, dollarDelimiter).instanceOf("email_html")
      .map(_.add("tables", tables).render().get)
      .recover { case e: Exception => logger.info("render exception ", e)
        s"ST Error: $e"
      }.getOrElse("")
  }

  private def covert2ListBuf(resultList: Seq[String]) = {
    val listBuffer: mutable.Buffer[List[String]] = resultList.toBuffer.map {
      str: String => CSVReader.open(Source.fromString(str)).readNext().get
    }
    val fieldTypeIndex = 1
    listBuffer.remove(fieldTypeIndex)
    listBuffer.prepend(List(""))
    listBuffer
  }

  private def nullValue2EmptyString(listBuffer: mutable.Buffer[List[String]]) = {
    listBuffer.map(seq => seq.map(s => if (null == s) "" else s))
  }


  def renderBySTGroup(sqlWithoutVars: String, queryKVMap: mutable.HashMap[String, String]): String = {
    val queryVars = queryKVMap.keySet.mkString("(", ",", ")")
    val sqlToRender = sqlWithoutVars.replaceAll("<>", "!=")
    val sqlTemplate =
      """delimiters "$", "$"""" +
        s"""sqlTemplate$queryVars ::= <<
           |$sqlToRender
           |>>""".stripMargin
    logger.info("sql template in renderSql:" + sqlTemplate)
    val stg: STGroupString = new STGroupString(sqlTemplate)
    val sqlST = stg.getInstanceOf("sqlTemplate")
    queryKVMap.foreach(kv => sqlST.add(kv._1, kv._2))
    sqlST.render().trim
  }


  def renderByST(sqlWithoutVars: String, queryKVMap: mutable.HashMap[String, String]): String = {
    val sqlToRender: String = sqlWithoutVars.replaceAll("<>", "!=")
    val sqlTemplate = new ST(sqlToRender, '$', '$')
    queryKVMap.foreach(kv => sqlTemplate.add(kv._1, kv._2))
    sqlTemplate.render()
  }

}
