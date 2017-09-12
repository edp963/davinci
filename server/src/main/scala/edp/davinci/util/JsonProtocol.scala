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

package edp.davinci.util

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import edp.davinci.KV
import edp.davinci.persistence.base.BaseEntity
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import spray.json._

object JsonProtocol extends DefaultJsonProtocol with SprayJsonSupport {

  // davinci
  implicit val formatUserGroup: RootJsonFormat[UserGroup] = jsonFormat8(UserGroup)
  implicit val formatPostGroupInfo: RootJsonFormat[PostGroupInfo] = jsonFormat2(PostGroupInfo)
  implicit val formatPutGroupInfo: RootJsonFormat[PutGroupInfo] = jsonFormat4(PutGroupInfo)
  implicit val formatGroupClassSeq: RootJsonFormat[PostGroupInfoSeq] = jsonFormat1(PostGroupInfoSeq)
  implicit val formatPutGroupSeq: RootJsonFormat[PutGroupInfoSeq] = jsonFormat1(PutGroupInfoSeq)

  implicit val formatPostSourceInfo: RootJsonFormat[PostSourceInfo] = jsonFormat5(PostSourceInfo)
  implicit val formatPutSourceInfo: RootJsonFormat[PutSourceInfo] = jsonFormat7(PutSourceInfo)
  implicit val formatPostSourceInfoSeq: RootJsonFormat[PostSourceInfoSeq] = jsonFormat1(PostSourceInfoSeq)
  implicit val formatPutSourceInfoSeq: RootJsonFormat[PutSourceInfoSeq] = jsonFormat1(PutSourceInfoSeq)

  implicit val formatSqlLog: RootJsonFormat[SqlLog] = jsonFormat8(SqlLog)
  implicit val formatSimpleSqlLog: RootJsonFormat[SimpleSqlLog] = jsonFormat7(SimpleSqlLog)
  implicit val formatSimpleSqlLogSeq: RootJsonFormat[SimpleSqlLogSeq] = jsonFormat1(SimpleSqlLogSeq)
  implicit val formatSqlLogSeq: RootJsonFormat[SqlLogSeq] = jsonFormat1(SqlLogSeq)

  implicit val formatTablePrivilege: RootJsonFormat[Source] = jsonFormat11(Source)


  implicit val formatRelUserGroupResponse: RootJsonFormat[PostRelUserGroup] = jsonFormat1(PostRelUserGroup)
  implicit val formatRelUserGroupResponseSeq: RootJsonFormat[PostRelUserGroupSeq] = jsonFormat1(PostRelUserGroupSeq)
  implicit val formatRelUserGroupRequest: RootJsonFormat[PutRelUserGroup] = jsonFormat2(PutRelUserGroup)
  implicit val formatRelUserGroupRequestSeq: RootJsonFormat[PutRelUserGroupSeq] = jsonFormat1(PutRelUserGroupSeq)

  implicit val formatUser: RootJsonFormat[User] = jsonFormat11(User)
  implicit val formatPostUserInfo: RootJsonFormat[PostUserInfo] = jsonFormat6(PostUserInfo)
  implicit val formatPutUserInfo: RootJsonFormat[PutUserInfo] = jsonFormat7(PutUserInfo)
  implicit val formatQueryUserInfo: RootJsonFormat[QueryUserInfo] = jsonFormat6(QueryUserInfo)
  implicit val formatPostUserInfoSeq: RootJsonFormat[PostUserInfoSeq] = jsonFormat1(PostUserInfoSeq)
  implicit val formatPutUserInfoSeq: RootJsonFormat[PutUserInfoSeq] = jsonFormat1(PutUserInfoSeq)

  implicit val formatWidget: RootJsonFormat[Widget] = jsonFormat14(Widget)
  implicit val formatPostWidgetInfo: RootJsonFormat[PostWidgetInfo] = jsonFormat8(PostWidgetInfo)
  implicit val formatPutWidgetInfo: RootJsonFormat[PutWidgetInfo] = jsonFormat10(PutWidgetInfo)
  implicit val formatPutWidgetSeq: RootJsonFormat[PutWidgetInfoSeq] = jsonFormat1(PutWidgetInfoSeq)
  implicit val formatPostWidgetSeq: RootJsonFormat[PostWidgetInfoSeq] = jsonFormat1(PostWidgetInfoSeq)


  implicit val formatPostRelDashboardWidget: RootJsonFormat[PostRelDashboardWidget] = jsonFormat8(PostRelDashboardWidget)
  implicit val formatPutRelDashboardWidget: RootJsonFormat[PutRelDashboardWidget] = jsonFormat9(PutRelDashboardWidget)
  implicit val formatPostRelDashboardWidgetSeq: RootJsonFormat[PostRelDashboardWidgetSeq] = jsonFormat1(PostRelDashboardWidgetSeq)
  implicit val formatPutRelDashboardWidgetSeq: RootJsonFormat[PutRelDashboardWidgetSeq] = jsonFormat1(PutRelDashboardWidgetSeq)

  implicit val formatWidgetInfo: RootJsonFormat[WidgetInfo] = jsonFormat10(WidgetInfo)
  implicit val formatDashboard: RootJsonFormat[Dashboard] = jsonFormat10(Dashboard)
  implicit val formatPostDashboardInfo: RootJsonFormat[PostDashboardInfo] = jsonFormat4(PostDashboardInfo)
  implicit val formatPutDashboardInfo: RootJsonFormat[PutDashboardInfo] = jsonFormat6(PutDashboardInfo)
  implicit val formatDashboardSeq: RootJsonFormat[PutDashboardSeq] = jsonFormat1(PutDashboardSeq)
  implicit val formatDashboardClassSeq: RootJsonFormat[PostDashboardInfoSeq] = jsonFormat1(PostDashboardInfoSeq)
  implicit val formatDashboardInfo: RootJsonFormat[DashboardInfo] = jsonFormat6(DashboardInfo)


  implicit val formatPostRelGroupBizlogic: RootJsonFormat[PostRelGroupView] = jsonFormat2(PostRelGroupView)
  implicit val formatPutRelGroupView: RootJsonFormat[PutRelGroupView] = jsonFormat3(PutRelGroupView)
  implicit val formatPostRelGroupBizlogicSeq: RootJsonFormat[PostRelGroupFlatTableSeq] = jsonFormat1(PostRelGroupFlatTableSeq)
  implicit val formatPutRelGroupBizlogicSeq: RootJsonFormat[PutRelGroupViewSeq] = jsonFormat1(PutRelGroupViewSeq)

  implicit val formatView: RootJsonFormat[View] = jsonFormat14(View)
  implicit val formatPostBizlogicInfo: RootJsonFormat[PostViewInfo] = jsonFormat8(PostViewInfo)
  implicit val formatPutBizlogicInfo: RootJsonFormat[PutViewInfo] = jsonFormat10(PutViewInfo)
  implicit val formatQUeryBizlogic: RootJsonFormat[QueryView] = jsonFormat10(QueryView)
  implicit val formatPostBizlogicInfoSeq: RootJsonFormat[PostViewInfoSeq] = jsonFormat1(PostViewInfoSeq)
  implicit val formatPutBizlogicInfoSeq: RootJsonFormat[PutViewInfoSeq] = jsonFormat1(PutViewInfoSeq)

  implicit val formatLibWidget: RootJsonFormat[LibWidget] = jsonFormat9(LibWidget)
  implicit val formatQueryLibWidget: RootJsonFormat[QueryLibWidget] = jsonFormat5(QueryLibWidget)

  implicit val formatSqlInfo: RootJsonFormat[SqlInfo] = jsonFormat1(SqlInfo)

  implicit val formatLoginClass: RootJsonFormat[LoginClass] = jsonFormat2(LoginClass)

  implicit val formatChangePwdClass: RootJsonFormat[ChangePwdClass] = jsonFormat2(ChangePwdClass)

  implicit val formatChangeUserPwdClass: RootJsonFormat[ChangeUserPwdClass] = jsonFormat3(ChangeUserPwdClass)

  implicit val formatSessionClass: RootJsonFormat[SessionClass] = jsonFormat4(SessionClass)

  implicit val formatResponseHeader: RootJsonFormat[ResponseHeader] = jsonFormat3(ResponseHeader)

  implicit val formatBaseInfo: RootJsonFormat[BaseInfo] = jsonFormat2(BaseInfo)

  implicit val formatPutLoginUserInfo: RootJsonFormat[LoginUserInfo] = jsonFormat2(LoginUserInfo)

  implicit val formatBizlogicResult: RootJsonFormat[ViewResult] = jsonFormat2(ViewResult)

  implicit val formatResponsePayload: RootJsonFormat[ResponsePayload] = jsonFormat1(ResponsePayload)

  implicit val formatKV: RootJsonFormat[KV] = jsonFormat2(KV)

  implicit val formatManualInfo: RootJsonFormat[ManualInfo] = jsonFormat3(ManualInfo)

  implicit val formatShareResult: RootJsonFormat[ShareResult] = jsonFormat2(ShareResult)

  implicit def formatRequestJson[A: JsonFormat]: RootJsonFormat[RequestJson[A]] = jsonFormat1(RequestJson.apply[A])

  implicit def formatRequestSeqJson[A: JsonFormat]: RootJsonFormat[RequestSeqJson[A]] = jsonFormat1(RequestSeqJson.apply[A])

  implicit def formatResponseJson[A: JsonFormat]: RootJsonFormat[ResponseJson[A]] = jsonFormat2(ResponseJson.apply[A])

  implicit def formatResponseSeqJson[A: JsonFormat]: RootJsonFormat[ResponseSeqJson[A]] = jsonFormat2(ResponseSeqJson.apply[A])

  implicit object formatBaseEntity extends RootJsonFormat[BaseEntity] {

    def write(obj: BaseEntity): JsValue = obj match {
      case view: View => view.toJson
      case dashboard: Dashboard => dashboard.toJson
      case group: UserGroup => group.toJson
      case ligWidget: LibWidget => ligWidget.toJson
      case source: Source => source.toJson
      case sqlLog: SqlLog => sqlLog.toJson
      case user: User => user.toJson
      case widget: Widget => widget.toJson
      case unknown@_ => serializationError(s"Marshalling issue with $unknown")
    }

    def read(value: JsValue): Nothing = {
      value match {
        case unknown@_ => deserializationError(s"Unmarshalling issue with $unknown ")
      }
    }
  }


}


