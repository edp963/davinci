
package davinci

import edp.davinci.util.DavinciConstants.{STEndChar, STStartChar, sqlSeparator}
import edp.davinci.KV
import edp.davinci.util.JsonUtils.json2caseClass
import edp.davinci.rest.RouteHelper._
import edp.davinci.util.{RegexMatcher, STRenderUtils, SqlParser}
import org.scalatest.FunSuite
import org.stringtemplate.v4.STGroupString

class MatchAndReplace extends FunSuite {
  test("expression map") {
    val expressionList = List("name = <v1<", "city in ($v2$)", "age >=10", "sex != '男'", "age < 20")
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
    val groupStr = "[{\"k\":\"v3\",\"v\":\"24\"},{\"k\":\"v3\",\"v\":\"45\"}]"
    val queryStr = "[{\"k\":\"v1\",\"v\":\"liaog\"}]"
    val flatTableSqls =
      """group@var $v1$ = mary;
        |group@var $v2$ = 'beijing','shanghai';
        |query@var $v3$ = 20;
        |query@var $v4$ = select * from table;
        |query@var $v5$ = '女';
        |
        |
        |query@var $date$='2017';
        |query@var $fromdate$;
        |update@var $todate$;
        |
        |        
        |{
        |    $if(date)$
        |        select * from table where (name = $v1$) and (city in ($v2$)) and age > $v3$ or sex != $v5$;
        |    $elseif(todate)$
        |        select a, b, c from table1 where a = $v5$ and b = $v5$;
        |    $elseif(fromdate)$
        |        afafjajfhjaf;
        |    $else$
        |        select 拒贷码,人数,CONCAT(round(人数/总数 *100,2),'%') as 占比 from table1 where a <> $v3$ and b = $v5$ and c = 5;
        |    $endif$
        |    adadaada
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


  test("template"){

    val queryStr = "[]"
    val flatTableSqls =
      """query@var $yugu_renshu$=yugu;
        |query@var $shenqing_renshu$;
        |query@var $shenqingtg_renshu$;
        |query@var $jinjian_renshu$;
        |query@var $shenpi_renshu$;
        |query@var $pihe_renshu$;
        |{
        |$if(shenqing_renshu)$
        |select
        |substring(t1.create_time, 12, 2) as 小时,
        |COUNT(DISTINCT  case when substring(t1.create_time, 1, 10) = curdate() then t1.tuser_id end) AS  '今天人数',
        |COUNT(DISTINCT  case when substring(t1.create_time, 1, 10) = DATE_SUB(CURDATE(),INTERVAL 1 DAY) then t1.tuser_id end) AS  '昨天人数',
        |COUNT(DISTINCT  case when substring(t1.create_time, 1, 10) = DATE_SUB(CURDATE(), INTERVAL 7 DAY) then t1.tuser_id end) AS  '7天前人数'
        |from tb_cbm_transport  t1
        |left join tb_cbm_limit_gjj  t2  on  t1.LIMIT_ID = t2.LIMIT_ID and t1.platform_code =t2.platform_code
        |where t2.LIMIT_STYLE ='social'
        |and t1.platform_code ='yrdGjjAs'
        |and substring(t1.create_time, 1, 10) IN  (curdate(), DATE_SUB(CURDATE(),INTERVAL 1 DAY),DATE_SUB(CURDATE(), INTERVAL 7 DAY))
        |group  by  substring(t1.create_time, 12, 2);
        |$elseif(shenqingtg_renshu)$
        |select
        |substring(t1.create_time, 12, 2) as 小时,
        |COUNT(DISTINCT  case when substring(t1.create_time, 1, 10) = curdate() then t1.tuser_id end) AS  '今天人数',
        |COUNT(DISTINCT  case when substring(t1.create_time, 1, 10) = DATE_SUB(CURDATE(),INTERVAL 1 DAY) then t1.tuser_id end) AS  '昨天人数',
        |COUNT(DISTINCT  case when substring(t1.create_time, 1, 10) = DATE_SUB(CURDATE(), INTERVAL 7 DAY) then t1.tuser_id end) AS  '7天前人数'
        |from tb_cbm_transport  t1
        |left join tb_cbm_limit_gjj  t2  on  t1.LIMIT_ID = t2.LIMIT_ID and t1.platform_code =t2.platform_code
        |where t2.LIMIT_STYLE ='social'
        |and t1.platform_code ='yrdGjjAs'
        |and t1.IS_PASS = 'T'
        |and t1.IS_SUCCESS = 'T'
        |and substring(t1.create_time, 1, 10) IN  (curdate(), DATE_SUB(CURDATE(),INTERVAL 1 DAY),DATE_SUB(CURDATE(), INTERVAL 7 DAY))
        |group  by  substring(t1.create_time, 12, 2);
        |$elseif(jinjian_renshu)$
        |select
        |substring(t1.yrd_time, 12, 2) as 小时,
        |COUNT(DISTINCT  case when substring(t1.yrd_time, 1, 10) = curdate() then t1.tuser_id end) AS  '今天人数',
        |COUNT(DISTINCT  case when substring(t1.yrd_time, 1, 10) = DATE_SUB(CURDATE(),INTERVAL 1 DAY) then t1.tuser_id end) AS  '昨天人数',
        |COUNT(DISTINCT  case when substring(t1.yrd_time, 1, 10) = DATE_SUB(CURDATE(), INTERVAL 7 DAY) then t1.tuser_id end) AS  '7天前人数'
        |from tb_cbm_transport  t1
        |left join tb_cbm_limit_gjj  t2  on  t1.LIMIT_ID = t2.LIMIT_ID and t1.platform_code =t2.platform_code
        |where t2.LIMIT_STYLE ='social'
        |and t1.platform_code ='yrdGjjAs'
        |and substring(t1.yrd_time, 1, 10) IN (curdate(), DATE_SUB(CURDATE(),INTERVAL 1 DAY),DATE_SUB(CURDATE(), INTERVAL 7 DAY))
        |group  by  substring(t1.yrd_time, 12, 2);
        |$elseif(shenpi_renshu)$
        |select
        |substring(t1.AUDIT_TIME, 12, 2) as 小时,
        |COUNT(DISTINCT  case when substring(t1.AUDIT_TIME, 1, 10) = curdate() then t1.tuser_id end) AS  '今天人数',
        |COUNT(DISTINCT  case when substring(t1.AUDIT_TIME, 1, 10) = DATE_SUB(CURDATE(),INTERVAL 1 DAY) then t1.tuser_id end) AS  '昨天人数',
        |COUNT(DISTINCT  case when substring(t1.AUDIT_TIME, 1, 10) = DATE_SUB(CURDATE(), INTERVAL 7 DAY) then t1.tuser_id end) AS  '7天前人数'
        |from tb_cbm_transport  t1
        |left join tb_cbm_limit_gjj  t2  on  t1.LIMIT_ID = t2.LIMIT_ID and t1.platform_code =t2.platform_code
        |where t2.LIMIT_STYLE ='social'
        |and t1.platform_code ='yrdGjjAs'
        |and substring(t1.AUDIT_TIME, 1, 10) IN (curdate(), DATE_SUB(CURDATE(),INTERVAL 1 DAY),DATE_SUB(CURDATE(), INTERVAL 7 DAY))
        |group  by  substring(t1.AUDIT_TIME, 12, 2);
        |$elseif(pihe_renshu)$
        |select
        |substring(t1.AUDIT_TIME, 12, 2) as 小时,
        |COUNT(DISTINCT  case when substring(t1.AUDIT_TIME, 1, 10) = curdate() then t1.tuser_id end) AS  '今天人数',
        |COUNT(DISTINCT  case when substring(t1.AUDIT_TIME, 1, 10) = DATE_SUB(CURDATE(),INTERVAL 1 DAY) then t1.tuser_id end) AS  '昨天人数',
        |COUNT(DISTINCT  case when substring(t1.AUDIT_TIME, 1, 10) = DATE_SUB(CURDATE(), INTERVAL 7 DAY) then t1.tuser_id end) AS  '7天前人数'
        |from tb_cbm_transport  t1
        |left join tb_cbm_limit_gjj  t2  on  t1.LIMIT_ID = t2.LIMIT_ID and t1.platform_code =t2.platform_code
        |where t2.LIMIT_STYLE ='social'
        |and t1.platform_code ='yrdGjjAs'
        |and STATUS!=50
        |and substring(t1.AUDIT_TIME, 1, 10) IN (curdate(), DATE_SUB(CURDATE(),INTERVAL 1 DAY),DATE_SUB(CURDATE(), INTERVAL 7 DAY))
        |group  by  substring(t1.AUDIT_TIME, 12, 2);
        |$else$
        |SELECT
        |substring(create_time, 12, 2) AS hour,
        |COUNT(DISTINCT  case when substring(create_time, 1, 10) =curdate() then tuser_id end) AS  '今天人数',
        |COUNT(DISTINCT  case when substring(create_time, 1, 10) = DATE_SUB(CURDATE(),INTERVAL 1 DAY) then tuser_id end) AS  '昨天人数',
        |COUNT(DISTINCT  case when substring(create_time, 1, 10) =DATE_SUB(CURDATE(), INTERVAL 7 DAY) then tuser_id end) AS  '7天前人数'
        |FROM tb_cbm_limit_gjj
        |WHERE platform_code ='yrdGjjAs'
        |and LIMIT_STYLE = 'social'
        |and substring(create_time, 1, 10) in (curdate(), DATE_SUB(CURDATE(),INTERVAL 1 DAY),DATE_SUB(CURDATE(), INTERVAL 7 DAY))
        |GROUP BY substring(create_time, 12, 2);
        |$endif$}""".stripMargin


    val queryParams = json2caseClass[Seq[KV]](queryStr)

    val trimSql = flatTableSqls.trim
    println("~~~~~~~~~~~~~~~~~~~~~~~~the initial sql template:\n" + trimSql)
    val sqls = if (trimSql.lastIndexOf(sqlSeparator) == trimSql.length - 1) trimSql.dropRight(1).split(sqlSeparator) else trimSql.split(sqlSeparator)
    val sqlWithoutVar = trimSql.substring(trimSql.indexOf(STStartChar) + 1, trimSql.indexOf(STEndChar)).trim
    val groupKVMap = getGroupKVMap(sqls, null)
    val queryKVMap = getQueryKVMap(sqls, queryParams)
    val mergeSql = RegexMatcher.matchAndReplace(sqlWithoutVar, groupKVMap)
    val renderedSql = if (queryKVMap.nonEmpty) STRenderUtils.renderSql(mergeSql, queryKVMap) else mergeSql
    println("~~~~~~~~~~~~~~~~~~~~~~~~sql:\n" + renderedSql)
  }

}
