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





package edp.davinci.util.sql

import edp.davinci.util.sql.SqlOperators.SqlOperators
import net.sf.jsqlparser.expression.ExpressionVisitorAdapter
import net.sf.jsqlparser.expression.operators.relational._
import net.sf.jsqlparser.parser.CCJSqlParserUtil
import net.sf.jsqlparser.statement.select.{PlainSelect, Select}
import org.apache.log4j.Logger

import scala.collection.mutable
import scala.collection.mutable.ListBuffer


object SqlOperators extends Enumeration {
  type SqlOperators = Value

  val IN = Value("IN")
  val NoTIN = Value("NOT IN")
  val EQUALSTO = Value("=")
  val BETWEEN = Value("BETWEEN")
  val GREATERTHAN = Value(">")
  val GREATERTHANEQUALS = Value(">=")
  val ISNULL = Value("IS NULL")
  val LIKE = Value("LIKE")
  val MINORTHAN = Value("<")
  val MINORTHANEQUALS = Value("<=")
  val NOTEQUALSTO = Value("!=")
  val EXISTS = Value("EXISTS")
}

object SqlParser extends SqlParser

trait SqlParser {
  private lazy val logger = Logger.getLogger(this.getClass)
  def getVisitor(listBuffer: ListBuffer[(SqlOperators.SqlOperators, List[String])]): ExpressionVisitorAdapter = {
    new ExpressionVisitorAdapter() {
      override def visit(expr: InExpression) {
        super.visit(expr)
        val exprlistBuffer = ListBuffer.empty[String]
        exprlistBuffer.append(expr.getLeftExpression.toString)
        exprlistBuffer.append(expr.getRightItemsList.toString)
        listBuffer.append((SqlOperators.IN, exprlistBuffer.toList))
      }

      override def visit(expr: EqualsTo) {
        super.visit(expr)
        val exprListBuffer = ListBuffer.empty[String]
        exprListBuffer.append(expr.getLeftExpression.toString)
        exprListBuffer.append(expr.getRightExpression.toString)
        listBuffer.append((SqlOperators.EQUALSTO, exprListBuffer.toList))
      }

      override def visit(expr: Between) {
        super.visit(expr)
        val exprListBuffer = ListBuffer.empty[String]
        exprListBuffer.append(expr.getLeftExpression.toString)
        exprListBuffer.append(expr.getBetweenExpressionStart.toString)
        exprListBuffer.append(expr.getBetweenExpressionEnd.toString)
        listBuffer.append((SqlOperators.BETWEEN, exprListBuffer.toList))
      }

      override def visit(expr: GreaterThan) {
        super.visit(expr)
        val exprListBuffer = ListBuffer.empty[String]
        exprListBuffer.append(expr.getLeftExpression.toString)
        exprListBuffer.append(expr.getRightExpression.toString)
        listBuffer.append((SqlOperators.GREATERTHAN, exprListBuffer.toList))
      }

      override def visit(expr: GreaterThanEquals) {
        super.visit(expr)
        val exprListBuffer = ListBuffer.empty[String]
        exprListBuffer.append(expr.getLeftExpression.toString)
        exprListBuffer.append(expr.getRightExpression.toString)
        listBuffer.append((SqlOperators.GREATERTHANEQUALS, exprListBuffer.toList))
      }

      override def visit(expr: IsNullExpression) {
        super.visit(expr)
        listBuffer.append((SqlOperators.ISNULL, List(expr.getLeftExpression.toString)))
      }

      override def visit(expr: LikeExpression) {
        super.visit(expr)
        val exprListBuffer = ListBuffer.empty[String]
        exprListBuffer.append(expr.getLeftExpression.toString)
        exprListBuffer.append(expr.getRightExpression.toString)
        listBuffer.append((SqlOperators.LIKE, exprListBuffer.toList))
      }

      override def visit(expr: MinorThan) {
        super.visit(expr)
        val exprListBuffer = ListBuffer.empty[String]
        exprListBuffer.append(expr.getLeftExpression.toString)
        exprListBuffer.append(expr.getRightExpression.toString)
        listBuffer.append((SqlOperators.MINORTHAN, exprListBuffer.toList))
      }

      override def visit(expr: MinorThanEquals) {
        super.visit(expr)
        val exprListBuffer = ListBuffer.empty[String]
        exprListBuffer.append(expr.getLeftExpression.toString)
        exprListBuffer.append(expr.getRightExpression.toString)
        listBuffer.append((SqlOperators.MINORTHANEQUALS, exprListBuffer.toList))
      }

      override def visit(expr: NotEqualsTo) {
        super.visit(expr)
        val exprListBuffer = ListBuffer.empty[String]
        exprListBuffer.append(expr.getLeftExpression.toString)
        exprListBuffer.append(expr.getRightExpression.toString)
        listBuffer.append((SqlOperators.NOTEQUALSTO, exprListBuffer.toList))
      }

      override
      def visit(expr: ExistsExpression) {
        super.visit(expr)
        listBuffer.append((SqlOperators.ISNULL, List(expr.getRightExpression.toString)))
      }
    }
  }


  def getParsedMap(expressionList: List[String]): mutable.Map[String, (SqlOperators, List[String])] = {
    val expressionMap = mutable.HashMap.empty[String, (SqlOperators, List[String])]
    val listBuffer = ListBuffer.empty[(SqlOperators, List[String])]
    val visitor = getVisitor(listBuffer)
    expressionList.foreach(expression => {
      try {
        val sqlToParse = s"SELECT * FROM davinci_table WHERE $expression"
        val select = CCJSqlParserUtil.parse(sqlToParse).asInstanceOf[Select]
        val plainSelect = select.getSelectBody.asInstanceOf[PlainSelect]
        val where = plainSelect.getWhere
        where.accept(visitor)
        expressionMap(expression) = listBuffer.head
        listBuffer.clear()
      }
      catch {
        case e: Exception => logger.error("expression parsed exception " , e)
      }
    })
    expressionMap
  }


}
