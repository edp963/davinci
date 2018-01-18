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

object RegexMatch extends RegexMatch

trait RegexMatch {
  lazy val groupRegex = "\\([a-zA-Z0-9_]{1,}\\s?\\w*[<>!=]*\\s?\\(?\\$\\w+\\$\\)?\\s?\\)"
  //  lazy val queryRegex = "\\$\\s*\\w+\\s*\\$"
  private lazy val logger = Logger.getLogger(this.getClass)

  def getMatchedItemList(sqlStr: String, REGEX: String): List[String] = {
    val listBuffer = ListBuffer.empty[String]
    val pattern = Pattern.compile(REGEX)
    val matcher = pattern.matcher(sqlStr)
    while (matcher.find())
      listBuffer.append(matcher.group())
    listBuffer.toList
  }


  def matchAndReplace(sqlWithoutVar: String, groupKVMap: mutable.HashMap[String, List[String]]): String = {
    val exprList = getMatchedItemList(sqlWithoutVar, groupRegex)
    val parsedMap = SqlParser.getParsedMap(exprList)
    var resultSql = sqlWithoutVar
    if (groupKVMap.nonEmpty) {
      val replaceMap = getGroupReplaceStr(parsedMap, groupKVMap)
      logger.info(s"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~sql before merge\n$sqlWithoutVar")
      replaceMap.foreach(tuple => resultSql = resultSql.replace(tuple._1, tuple._2))
      logger.info(s"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~sql after merge\n$resultSql")
    }
    resultSql
  }


  private def getGroupReplaceStr(parsedMap: mutable.Map[String, (SqlOperators, List[String])], kvMap: mutable.HashMap[String, List[String]]): mutable.Map[String, String] = {
    val replaceMap = mutable.Map.empty[String, String]
    parsedMap.foreach(tuple => {
      val (expr, (op, expressionList)) = tuple
      val (left, right) = (expressionList.head, expressionList.last)
      val gVar = right.substring(right.indexOf(dollarDelimiter) + 1, right.lastIndexOf(dollarDelimiter)).trim
      if (kvMap.contains(gVar)) {
        val values = kvMap(gVar)
        val oneSizeReplace = s"$left ${op.toString} ${values.mkString("")}"
        val refactorExprWithOr = if (values.size > 1) values.map(v => s"$left ${op.toString} $v").mkString("(", " OR ", ")") else oneSizeReplace
        val replaceStr = op match {
          case EQUALSTO => if (values.size > 1) s"$left ${IN.toString} ${values.mkString("(", ",", ")")}" else oneSizeReplace
          case NOTEQUALSTO => if (values.size > 1) s"$left ${NoTIN.toString} ${values.mkString("(", ",", ")")}" else oneSizeReplace
          case BETWEEN => if (values.size > 1) s"$left ${IN.toString} ${values.mkString("(", ",", ")")}" else oneSizeReplace
          case IN => s"$left ${op.toString} ${values.mkString("(", ",", ")")}"
          case GREATERTHAN => refactorExprWithOr
          case GREATERTHANEQUALS => refactorExprWithOr
          case MINORTHAN => refactorExprWithOr
          case MINORTHANEQUALS => refactorExprWithOr
          case _ => ""
        }
        replaceMap(expr) = replaceStr
      }
    })
    replaceMap
  }
}
