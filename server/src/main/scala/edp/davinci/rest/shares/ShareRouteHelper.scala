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


package edp.davinci.rest.shares

import java.net.URLDecoder

import edp.davinci.util.DavinciConstants.{conditionSeparator, defaultEncode}
import edp.davinci.rest._
import edp.davinci.util.JsonProtocol._
import edp.davinci.util.JsonUtils.{caseClass2json, json2caseClass}
import edp.davinci.util._
import edp.davinci.{KV, ModuleInstance, ParamHelper}
import org.apache.log4j.Logger

object ShareRouteHelper {
  private val logger = Logger.getLogger(this.getClass)

  lazy val aesPassword: String = ModuleInstance.getModule.config.getString("aes.secret")

  def getShareURL(userId: Long, infoId: Long, authorizedName: String): String = {
    val shareAuthInfo = caseClass2json[ShareAuthClass](ShareAuthClass(userId, infoId, authorizedName))
    val MD5Info = MD5Utils.getMD5(shareAuthInfo)
    val shareQueryInfo = ShareClass(userId, infoId, authorizedName, MD5Info)
    AesUtils.encrypt(caseClass2json(shareQueryInfo), aesPassword)
  }


  def mergeURLManual(shareURLArr: Array[String], manualInfo: ManualInfo): ManualInfo = {
    val (manualFilters, queryParams, adHoc) =
      if (null == manualInfo) (null, null, null)
      else (manualInfo.manualFilters.orNull, manualInfo.params.orNull, manualInfo.adHoc.orNull)
    val urlDecode = shareURLArr.last
    logger.info("info after urlDecode: " + urlDecode)
    val base64decoder = new sun.misc.BASE64Decoder
    val base64decode: String = new String(base64decoder.decodeBuffer(urlDecode))
    logger.info("info after base64decode: " + base64decode)
    val paramAndFilter: ParamHelper = json2caseClass[ParamHelper](base64decode)
    val (urlFilters, urlParams) = (paramAndFilter.f_get, paramAndFilter.p_get)
    logger.info("url filter: " + urlFilters)
    val filters = mergeFilters(manualFilters, urlFilters)
    val params = mergeParams(queryParams, urlParams)
    ManualInfo(Some(adHoc), Some(filters), Some(params))
  }


  def isValidShareInfo(shareInfo: ShareClass): Boolean = {
    if (null == shareInfo) false
    else {
      val MD5Info = MD5Utils.getMD5(caseClass2json(ShareAuthClass(shareInfo.userId, shareInfo.infoId, shareInfo.authName)))
      if (MD5Info == shareInfo.md5) true else false
    }
  }


  def getShareClass(shareInfoStr: String): ShareClass = {
    val infoArr: Array[String] = shareInfoStr.split(conditionSeparator.toString)
    if (infoArr.head.trim != "") {
      try {
        val jsonShareInfo = AesUtils.decrypt(infoArr.head.trim, aesPassword)
        json2caseClass[ShareClass](jsonShareInfo)
      } catch {
        case e: Throwable => logger.error("failed to resolve share info", e)
          null.asInstanceOf[ShareClass]
      }
    }
    else null.asInstanceOf[ShareClass]
  }


  private def mergeFilters(manualFilters: String, urlFilters: String) = {
    if (null != manualFilters && manualFilters != "")
      if (null != urlFilters) Set(manualFilters, urlFilters).map(f => s"($f)").mkString(" AND ") else manualFilters
    else urlFilters
  }


  private def mergeParams(widgetParams: List[KV], urlParams: List[KV]) = {
    if (null != widgetParams && widgetParams.nonEmpty)
      if (null != urlParams) widgetParams ::: urlParams else widgetParams
    else urlParams
  }


}
