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

import edp.davinci.KV
import edp.davinci.persistence.entities._

case class LoginClass(username: String, password: String)

case class LoginUserInfo(title: String, name: String)

case class SessionClass(userId: Long, groupIdList: List[Long], admin: Boolean, currentTs: Long = System.currentTimeMillis())

case class ChangePwdClass(oldPass: String, newPass: String)

case class ChangeUserPwdClass(id: Long, oldPass: String, newPass: String)

case class SqlInfo(sqls: Array[String])

case class BaseInfo(id: Long, name: String)

case class ManualInfo(adHoc: Option[String] = None, manualFilters: Option[String] = None, params: Option[List[KV]] = None)

case class WidgetInfo(id: Long, widget_id: Long, flatTableId: Long, position_x: Int, position_y: Int, width: Int, length: Int, trigger_type: String, trigger_params: String, aesStr: String = "")

case class DashboardInfo(id: Long, name: String, pic: String, desc: String, publish: Boolean, widgets: Seq[WidgetInfo])

case class PostRelUserGroupSeq(payload: Seq[PostRelUserGroup])

case class PutRelUserGroupSeq(payload: Seq[PutRelUserGroup])

case class PostRelDashboardWidgetSeq(payload: Seq[PostRelDashboardWidget])

case class PutRelDashboardWidgetSeq(payload: Seq[PutRelDashboardWidget])

case class PostRelGroupFlatTableSeq(payload: Seq[PostRelGroupView])

case class PutRelGroupViewSeq(payload: Seq[PutRelGroupView])

case class PostUserInfoSeq(payload: Seq[PostUserInfo])

case class PostViewInfoSeq(payload: Seq[PostViewInfo])

case class PostDashboardInfoSeq(payload: Seq[PostDashboardInfo])

case class PostGroupInfoSeq(payload: Seq[PostGroupInfo])

case class PostSourceInfoSeq(payload: Seq[PostSourceInfo])

case class SimpleSqlLogSeq(payload: Seq[SimpleSqlLog])

case class PostWidgetInfoSeq(payload: Seq[PostWidgetInfo])

case class SimpleRelUserGroupSeq(payload: Seq[SimpleRelUserGroup])

case class PutViewInfoSeq(payload: Seq[PutViewInfo])

case class PutDashboardSeq(payload: Seq[PutDashboardInfo])

case class PutGroupInfoSeq(payload: Seq[PutGroupInfo])

case class PutSourceInfoSeq(payload: Seq[PutSourceInfo])

case class SqlLogSeq(payload: Seq[SqlLog])

case class PutUserInfoSeq(payload: Seq[PutUserInfo])

case class PutWidgetInfoSeq(payload: Seq[PutWidgetInfo])

case class ViewResult(result: Seq[String] = null, totalCount: Long)

case class ShareResult(result: Seq[String], totalCount: Long)

case class ResponsePayload(response: String)

case class RequestJson[A](payload: A)

case class RequestSeqJson[A](payload: Seq[A])

case class ResponseHeader(code: Int, msg: String, token: String = "")

case class ResponseJson[A](header: ResponseHeader, payload: A)

case class ResponseSeqJson[A](header: ResponseHeader, payload: Seq[A])
