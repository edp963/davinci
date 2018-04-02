package edp.davinci.rest.view

import edp.davinci.KV
import edp.davinci.util.common.DavinciConstants.{STEndChar, STStartChar, dollarDelimiter}
import edp.davinci.util.common.RegexMatcher.getMatchedItemList
import edp.davinci.util.sql.SqlOperators._
import edp.davinci.util.sql.SqlParser
import org.slf4j.LoggerFactory

import scala.collection.mutable

class GroupVar(parameters: Seq[KV], defaultParameters: mutable.HashMap[String, List[String]]) {
  private lazy val logger = LoggerFactory.getLogger(this.getClass)
  private lazy val groupRegex = "\\([a-zA-Z0-9_]{1,}\\s?\\w*[<>!=]*\\s?\\(?\\$\\w+\\$\\)?\\s?\\)"
  private lazy val groupKVMap = mutable.HashMap.empty[String, List[String]]


  private def initGroupKVMap: mutable.HashMap[String, List[String]] = {
    if (isValidParam)
      parameters.foreach(group => {
        val (k, v) = (group.k, group.v)
        if (groupKVMap.contains(k))
          groupKVMap(k) = groupKVMap(k) ::: List(v)
        else groupKVMap(k) = List(v)
      })
    if (defaultParameters.nonEmpty)
      defaultParameters.foreach(d => {
        val (key, value) = d
        if (!groupKVMap.contains(key)) groupKVMap(key) = value
      })
    groupKVMap
  }


  private def isValidParam: Boolean = {
    if (null != parameters && parameters.nonEmpty) true else false
  }

  def replace(sql: String): String = {
    val groupKVMap = initGroupKVMap
    var resultSql = getNoVarSql(sql)
    if (groupKVMap.nonEmpty) {
      val exprList = getMatchedItemList(resultSql, groupRegex)
      val parsedMap = SqlParser.getParsedMap(exprList)
      val replaceMap = getGroupReplaceMap(parsedMap, groupKVMap)
      logger.info(s"sql before merge: $resultSql")
      replaceMap.foreach(tuple => resultSql = resultSql.replace(tuple._1, tuple._2))
      logger.info(s"sql after merge: $resultSql")
    }
    resultSql.trim
  }

  private def getNoVarSql(sql: String) = {
    val noVarSql = sql.substring(sql.indexOf(STStartChar) + 1, sql.indexOf(STEndChar)).trim
    logger.info("sql without var defined: " + noVarSql)
    noVarSql
  }


  private def getGroupReplaceMap(parsedMap: mutable.Map[String, (SqlOperators, List[String])], groupKVMap: mutable.HashMap[String, List[String]]): mutable.Map[String, String] = {
    val replaceMap = mutable.Map.empty[String, String]
    parsedMap.foreach(tuple => {
      val (exp, (op, expressionList)) = tuple
      val (left, right) = (expressionList.head, expressionList.last)
      val groupVar = right.substring(right.indexOf(dollarDelimiter) + 1, right.lastIndexOf(dollarDelimiter)).trim
      if (groupKVMap.contains(groupVar)) {
        val values = groupKVMap(groupVar)
        val oneSizeReplace = s"$left ${op.toString} ${values.mkString("")}"
        val refactorExpWithOr = if (values.lengthCompare(1) > 0) values.map(v => s"$left ${op.toString} $v").mkString("(", " OR ", ")") else oneSizeReplace
        val replaceStr = op match {
          case EQUALSTO => if (values.lengthCompare(1) > 0) s"$left ${IN.toString} ${values.mkString("(", ",", ")")}" else oneSizeReplace
          case NOTEQUALSTO => if (values.lengthCompare(1) > 0) s"$left ${NoTIN.toString} ${values.mkString("(", ",", ")")}" else oneSizeReplace
          case BETWEEN => if (values.lengthCompare(1) > 0) s"$left ${IN.toString} ${values.mkString("(", ",", ")")}" else oneSizeReplace
          case IN => s"$left ${op.toString} ${values.mkString("(", ",", ")")}"
          case GREATERTHAN => refactorExpWithOr
          case GREATERTHANEQUALS => refactorExpWithOr
          case MINORTHAN => refactorExpWithOr
          case MINORTHANEQUALS => refactorExpWithOr
          case _ => ""
        }
        replaceMap(exp) = replaceStr
      }
    })
    replaceMap
  }

}
