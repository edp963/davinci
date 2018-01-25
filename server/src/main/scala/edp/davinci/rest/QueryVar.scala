package edp.davinci.rest

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
