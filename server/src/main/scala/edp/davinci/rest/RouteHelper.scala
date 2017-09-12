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

package edp.davinci.rest

import java.sql.SQLException
import edp.davinci.DavinciConstants._
import akka.http.scaladsl.model.ContentType.NonBinary
import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.model.headers.ContentDispositionTypes.{attachment, inline}
import akka.http.scaladsl.model.{HttpEntity, _}
import akka.http.scaladsl.server.{Directives, Route, StandardRoute}
import edp.davinci.KV
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.JsonUtils.json2caseClass
import edp.davinci.util.ResponseUtils.getHeader
import edp.davinci.util.SqlUtils._
import org.slf4j.LoggerFactory
import scala.collection.mutable.ListBuffer
import scala.concurrent.Future
import scala.util.{Failure, Success}
import edp.davinci.util.STRenderUtils.getHTMLStr
import edp.davinci.util.CommonUtils.covert2CSV

object RouteHelper extends Directives {
  private val logger = LoggerFactory.getLogger(this.getClass)

  def getResultBySource(sourceFuture: Future[Seq[(String, String, String, String)]],
                        contentType: ContentType.NonBinary,
                        urlFilters: String,
                        paramSeq: Seq[KV],
                        paginateAndSort: String,
                        adHocSql: String = null): Route = {
    onComplete(sourceFuture) {
      case Success(sourceInfo) =>
        if (sourceInfo.nonEmpty) {
          try {
            val (sqlTemp, tableName, connectionUrl, _) = sourceInfo.head
            val group = sourceInfo.map(_._4).filter(_.trim != "")
            val groupVars = group.flatMap(g => json2caseClass[Seq[KV]](g))
            if (sqlTemp.trim != "") {
              val resultList = sqlExecute(urlFilters, sqlTemp, tableName, adHocSql, paginateAndSort, connectionUrl, paramSeq, groupVars)
              contentTypeMatch(resultList, contentType)
            }
            else complete(BadRequest, ResponseJson[String](getHeader(400, "flatTable sqls is empty", null), ""))
          }
          catch {
            case sqlEx: SQLException => complete(BadRequest, ResponseJson[String](getHeader(400, sqlEx.getMessage, null), "sql synx exception"))
            case ex: Throwable => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
          }
        } else complete(BadRequest, ResponseJson[String](getHeader(400, "", null), "source info is empty"))
      case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, null), ""))
    }
  }


  def contentTypeMatch(resultList: (ListBuffer[Seq[String]], Long), contentType: NonBinary): StandardRoute = {
    val contentDisposition = if (contentType == textHtml) headers.`Content-Disposition`(inline, Map("filename" -> s"share.html")).asInstanceOf[HttpHeader]
    else headers.`Content-Disposition`(attachment, Map("filename" -> s"share.CSV")).asInstanceOf[HttpHeader]
    val route = contentType match {
      case `textHtml` =>
        complete(HttpResponse(headers = List(contentDisposition), entity = HttpEntity(textHtml, getHTMLStr(resultList._1))))
      case `textCSV` =>
        val responseEntity = HttpEntity(textCSV, resultList._1.map(row => {
          val mapRow = row.map(_.split(CSVHeaderSeparator).head)
          covert2CSV(mapRow)
        }).mkString("\n"))
        complete(HttpResponse(headers = List(contentDisposition), entity = responseEntity))
      case `appJson` =>
        val CSVResult = resultList._1.map(covert2CSV)
        complete(OK, ResponseJson[ViewResult](getHeader(200, null), ViewResult(CSVResult, resultList._2)))
      case _ => logger.info("unsupported contentType")
        complete(BadRequest, ResponseJson[String](getHeader(400, "", null), "unsupported contentType"))
    }
    route
  }

}

