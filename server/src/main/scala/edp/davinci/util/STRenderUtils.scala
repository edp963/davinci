

package edp.davinci.util

import com.github.tototoshi.csv.CSVReader
import edp.davinci.util.DavinciConstants._
import grizzled.string.template.{StringTemplate, Variable}
import org.apache.log4j.Logger
import org.clapper.scalasti.{Constants, STGroupFile}
import org.stringtemplate.v4.{ST, STGroupString}

import scala.collection.mutable
import scala.io.Source

object STRenderUtils extends STRenderUtils

trait STRenderUtils {
  private lazy val logger = Logger.getLogger(this.getClass)

  def getHTML(resultList: Seq[String], stgPath: String = "stg/tmpl.stg"): String = {
    val listBuf: mutable.Buffer[List[String]] = resultList.toBuffer.map {
      str:String => CSVReader.open(Source.fromString(str)).readNext().get
    }
    val columns: List[String] = listBuf.head
    listBuf.remove(0,2)
    listBuf.prepend(columns)
    listBuf.prepend(List(""))
    val noNullResult = listBuf.map(seq => seq.map(s => if (null == s) "" else s))
    val tables = Seq(noNullResult)
    STGroupFile(stgPath, Constants.DefaultEncoding, dollarDelimiter, dollarDelimiter).instanceOf("email_html")
      .map(_.add("tables", tables).render().get)
      .recover { case e: Exception => logger.info("render exception ", e)
        s"ST Error: $e"
      }.getOrElse("")
  }

  def renderSql(sqlWithoutVars: String, queryKVMap: mutable.HashMap[String, String]): String = {
    val queryVars = queryKVMap.keySet.mkString("(", ",", ")")
    val sqlToRender = sqlWithoutVars.replaceAll("<>", "!=")
    val sqlTemplate =
      """delimiters "$", "$"""" +
        s"""sqlTemplate$queryVars ::= <<
           |$sqlToRender
           |>>""".stripMargin
    logger.info("~~~~~~~~~~~~~~~~~~~~~~~~sql template after merge:\n" + sqlTemplate)
    val stg: STGroupString = new STGroupString(sqlTemplate)
    val sqlST = stg.getInstanceOf("sqlTemplate")
    queryKVMap.foreach(kv => sqlST.add(kv._1, kv._2))
    sqlST.render()
  }


  def renderSqlByST(sqlWithoutVars: String, queryKVMap: mutable.HashMap[String, String]): String = {
    val sqlToRender: String = sqlWithoutVars.replaceAll("<>", "!=")
    val sqlTemplate = new ST(sqlToRender,'$','$')
    queryKVMap.foreach(kv => sqlTemplate.add(kv._1, kv._2))
    sqlTemplate.render()
  }

}
