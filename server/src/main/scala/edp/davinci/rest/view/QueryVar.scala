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

package edp.davinci.rest.view

import edp.davinci.KV
import edp.davinci.util.common.STRender
import org.slf4j.LoggerFactory

import scala.collection.mutable

class QueryVar(parameters: Seq[KV], defaultParameters: mutable.HashMap[String, List[String]]) {
  private lazy val logger = LoggerFactory.getLogger(this.getClass)
  private lazy val queryKVMap = mutable.HashMap.empty[String, String]

  def render(sql: String): String = {
    initQueryKVMap()
    STRender.renderBySTGroup(sql, queryKVMap)
  }


  def initQueryKVMap(): Unit = {
    try {
      if (isValidParam) parameters.foreach(param => queryKVMap(param.k) = param.v)
      if (defaultParameters.nonEmpty)
        defaultParameters.foreach(g => {
          val (key, value) = g
          if (!queryKVMap.contains(key))
            queryKVMap(key) = value.mkString(",")
        })
    } catch {
      case e: Throwable => logger.error("query var is not in right format!!!", e)
    }
  }

  private def isValidParam: Boolean = {
    if (null != parameters && parameters.nonEmpty) true else false
  }


}
