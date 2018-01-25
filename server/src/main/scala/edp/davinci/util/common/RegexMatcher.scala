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

import java.util.regex.Pattern

import edp.davinci.util.common.DavinciConstants._
import edp.davinci.util.sql.SqlOperators._
import edp.davinci.util.sql.SqlParser
import org.apache.log4j.Logger

import scala.collection.mutable
import scala.collection.mutable.ListBuffer

object RegexMatcher extends RegexMatcher

trait RegexMatcher {
  def getMatchedItemList(sqlStr: String, regex: String): List[String] = {
    val listBuffer = ListBuffer.empty[String]
    val pattern = Pattern.compile(regex)
    val matcher = pattern.matcher(sqlStr)
    while (matcher.find())
      listBuffer.append(matcher.group())
    listBuffer.toList
  }
}
