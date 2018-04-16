/*-
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
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

import edp.davinci.rest._
import edp.davinci.rest.user.UserService
import edp.davinci.rest.widget.WidgetService
import edp.davinci.util.common.DavinciConstants.conditionSeparator
import edp.davinci.util.common.PermissionType
import edp.davinci.util.encode.{AesUtils, MD5Utils}
import edp.davinci.util.json.JsonUtils.{caseClass2json, json2caseClass}
import edp.davinci.{KV, ModuleInstance, ParamHelper}
import org.apache.log4j.Logger

import scala.concurrent.Await
import scala.concurrent.duration._

object ShareService {
  private val logger = Logger.getLogger(this.getClass)

  lazy val aesPassword: String = ModuleInstance.getModule.config.getString("aes.secret")

  def hasDownloadPermission(widgetId: Long, userId: Long): Boolean = {
    getUserPermission(widgetId, userId).contains(PermissionType.DOWNLOAD) || isAdmin(userId)
  }

  def hasSharePermission(widgetId: Long, userId: Long): Boolean = {
    getUserPermission(widgetId, userId).contains(PermissionType.SHARE) || isAdmin(userId)
  }

  private def isAdmin(userId: Long) = {
    Await.result(UserService.getUserById(userId), new FiniteDuration(30, SECONDS))._1
  }

  def getUserPermission(widgetId: Long, userId: Long): Set[String] = {
    val permissionSeq = Await.result(WidgetService.getWidgetConfig(widgetId, userId), new FiniteDuration(30, SECONDS))
    val permissionSet = permissionSeq.map(json2caseClass[Permission]).flatMap(_.authority).toSet
    logger.info(s"user id $userId has permission ${permissionSet.mkString(",")}")
    permissionSet
  }

  def getShareURL(userId: Long, shareEntityId: Long, authorizedName: String): String = {
    val shareAuthClass = caseClass2json[ShareAuthClass](ShareAuthClass(userId, shareEntityId, authorizedName))
    val MD5String = MD5Utils.getMD5(shareAuthClass)
    val shareClass = ShareClass(userId, shareEntityId, authorizedName, MD5String)
    AesUtils.encrypt(caseClass2json(shareClass), aesPassword)
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

  def isValidShareClass(shareClass: ShareClass): Boolean = {
    if (null == shareClass) false
    else {
      val MD5String = MD5Utils.getMD5(caseClass2json(ShareAuthClass(shareClass.userId, shareClass.infoId, shareClass.authName)))
      if (MD5String == shareClass.md5) true else false
    }
  }


  def getShareClass(shareString: String): ShareClass = {
    val shareURLArr: Array[String] = shareString.split(conditionSeparator.toString)
    if (shareURLArr.head.trim != "") {
      try {
        val shareURLJson = AesUtils.decrypt(shareURLArr.head.trim, aesPassword)
        json2caseClass[ShareClass](shareURLJson)
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


  private def mergeParams(queryParams: List[KV], urlParams: List[KV]) = {
    if (null != queryParams && queryParams.nonEmpty)
      if (null != urlParams) queryParams ::: urlParams else queryParams
    else urlParams
  }


}
