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
package davinci

import edp.davinci.DavinciConstants.{STEndChar, STStartChar, sqlSeparator}
import edp.davinci.KV
import edp.davinci.util.JsonUtils.json2caseClass
import edp.davinci.util.SqlUtils._
import edp.davinci.util.{RegexMatcher, STRenderUtils, SqlParser}
import org.scalatest.FunSuite
import org.stringtemplate.v4.STGroupString

class MatchAndReplace extends FunSuite {
  ignore("expression map") {
    val expressionList = List("name = <v1<", "city in ('beijing','shanghai')", "age >=10", "sex != '男'", "age < 20")
    val expressionMap = SqlParser.getParsedMap(expressionList)
    expressionMap.foreach(e => {
      println(e._2._1)
      println(e._1)
      e._2._2.foreach(println)
      println("~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    })
    assert("" == "")
  }

  test("get expression list") {
    val str = "Is is the cost of of gasoline going up up where ((name_) = <v1_<) and (city =<v2<) and (age > <v3<) or sex != '男'"
    val regex = "\\(<^\\<]*\\<\\w+\\<\\s?\\)"
    val expressionList = RegexMatcher.getMatchedItemList(str, regex)
    expressionList.foreach(println)
    val exprList = List("((name_) = <v1_<)", "(city =<v2<)", "(age > <v3<)")
    assert(exprList == expressionList, "this is right what i want")
  }

  test("match all") {
    val groupStr = "[{\"k\":\"v2\",\"v\":\"'北京'\"},{\"k\":\"v3\",\"v\":\"24\"},{\"k\":\"v2\",\"v\":\"'shanghai'\"},{\"k\":\"v3\",\"v\":\"45\"}]"
    val queryStr = "[{\"k\":\"v1\",\"v\":\"liaog\"},{\"k\":\"date\",\"v\":\"'2017-08-23'\"}]"
    val flatTableSqls =
      """group@var $v1$ = mary;
        |group@var $v2$ = 'beijing';
        |query@var $v3$ = 20;
        |query@var $v4$ = select * from table;
        |query@var $v5$ = '女';
        |
        |
        |query@var $date$;
        |group@var $fromdate$;
        |update@var $todate$;
        |
        |        
        |{
        |    $if(date)$
        |        select * from table where (name = $v1$) and (city = $v2$) and age > $v3$ or sex != $v5$;
        |    $elseif(fromdate&&todate)$
        |        select a, b, c from table1 where a = $v5$ and b = $v5$;
        |    $else$
        |        select 拒贷码,人数,CONCAT(round(人数/总数 *100,2),'%') as 占比 from table1 where a <> $v3$ and b = $v5$ and c = 5;
        |    $endif$
        |}""".stripMargin

    val groupParams = json2caseClass[Seq[KV]](groupStr)
    val queryParams = json2caseClass[Seq[KV]](queryStr)

    val trimSql = flatTableSqls.trim
    println("~~~~~~~~~~~~~~~~~~~~~~~~the initial sql template:\n" + trimSql)
    val sqls = if (trimSql.lastIndexOf(sqlSeparator) == trimSql.length - 1) trimSql.dropRight(1).split(sqlSeparator) else trimSql.split(sqlSeparator)
    val sqlWithoutVar = trimSql.substring(trimSql.indexOf(STStartChar) + 1, trimSql.indexOf(STEndChar)).trim
    val groupKVMap = getGroupKVMap(sqls, groupParams)
    val queryKVMap = getQueryKVMap(sqls, queryParams)
    val mergeSql = RegexMatcher.matchAndReplace(sqlWithoutVar, groupKVMap)
    val renderedSql = if (queryKVMap.nonEmpty) STRenderUtils.renderSql(mergeSql, queryKVMap) else mergeSql
    println("~~~~~~~~~~~~~~~~~~~~~~~~sql:\n" + renderedSql)
  }


  test("unit test") {
    val templates =
      """delimiters "%", "%"
        |method(name) ::= <<
        |%stat(name)%
        |>>
        |stat(name,value="99") ::= "x=%value%; // %name%"
        |
      """.stripMargin
    val group = new STGroupString(templates)
    val b = group.getInstanceOf("method")
    b.add("name", "foo")
    val expecting = "x=99; // foo"
    val result = b.render
    println(expecting == result)
  }

}
