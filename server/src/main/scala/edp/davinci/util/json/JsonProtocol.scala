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


package edp.davinci.util.json

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import edp.davinci.KV
import edp.davinci.persistence.base.BaseEntity
import edp.davinci.persistence.entities._
import edp.davinci.rest._
import spray.json._

object JsonProtocol extends DefaultJsonProtocol with SprayJsonSupport {

  // davinci
  implicit val formatUserGroup: RootJsonFormat[UserGroup] = jsonFormat8(UserGroup)
  implicit val formatPostGroupInfo: RootJsonFormat[Group4Post] = jsonFormat2(Group4Post)
  implicit val formatPutGroupInfo: RootJsonFormat[Group4Put] = jsonFormat3(Group4Put)
  implicit val formatGroupClassSeq: RootJsonFormat[Group4PostSeq] = jsonFormat1(Group4PostSeq)
  implicit val formatPutGroupSeq: RootJsonFormat[Group4PutSeq] = jsonFormat1(Group4PutSeq)

  implicit val formatPostSourceInfo: RootJsonFormat[Source4Post] = jsonFormat5(Source4Post)
  implicit val formatPutSourceInfo: RootJsonFormat[Source4Put] = jsonFormat6(Source4Put)
  implicit val formatPostSourceInfoSeq: RootJsonFormat[Source4PostSeq] = jsonFormat1(Source4PostSeq)
  implicit val formatPutSourceInfoSeq: RootJsonFormat[Source4PutSeq] = jsonFormat1(Source4PutSeq)

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
  implicit val formatPostUserInfo: RootJsonFormat[User4Post] = jsonFormat6(User4Post)
  implicit val formatPutUserInfo: RootJsonFormat[User4Put] = jsonFormat7(User4Put)
  implicit val formatQueryUserInfo: RootJsonFormat[User4Query] = jsonFormat5(User4Query)
  implicit val formatPostUserInfoSeq: RootJsonFormat[PostUserSeq] = jsonFormat1(PostUserSeq)
  implicit val formatPutUserInfoSeq: RootJsonFormat[PutUserSeq] = jsonFormat1(PutUserSeq)

  implicit val formatWidget: RootJsonFormat[Widget] = jsonFormat15(Widget)
  implicit val formatPostWidgetInfo: RootJsonFormat[PostWidget] = jsonFormat9(PostWidget)
  implicit val formatPutWidgetInfo: RootJsonFormat[PutWidget] = jsonFormat11(PutWidget)
  implicit val formatPutWidgetSeq: RootJsonFormat[PutWidgetSeq] = jsonFormat1(PutWidgetSeq)
  implicit val formatPostWidgetSeq: RootJsonFormat[PostWidgetSeq] = jsonFormat1(PostWidgetSeq)


  implicit val formatPostRelDashboardWidget: RootJsonFormat[PostRelDashboardWidget] = jsonFormat8(PostRelDashboardWidget)
  implicit val formatPutRelDashboardWidget: RootJsonFormat[PutRelDashboardWidget] = jsonFormat10(PutRelDashboardWidget)
  implicit val formatPostRelDashboardWidgetSeq: RootJsonFormat[PostRelDashboardWidgetSeq] = jsonFormat1(PostRelDashboardWidgetSeq)
  implicit val formatPutRelDashboardWidgetSeq: RootJsonFormat[PutRelDashboardWidgetSeq] = jsonFormat1(PutRelDashboardWidgetSeq)


  implicit val formatWidgetInfo: RootJsonFormat[WidgetLayout] = jsonFormat12(WidgetLayout)
  implicit val formatDashboard: RootJsonFormat[Dashboard] = jsonFormat12(Dashboard)
  implicit val formatPostDashboardInfo: RootJsonFormat[PostDashboard] = jsonFormat6(PostDashboard)
  implicit val formatPutDashboardInfo: RootJsonFormat[PutDashboard] = jsonFormat9(PutDashboard)
  implicit val formatDashboardSeq: RootJsonFormat[PutDashboardSeq] = jsonFormat1(PutDashboardSeq)
  implicit val formatDashboardClassSeq: RootJsonFormat[PostDashboardSeq] = jsonFormat1(PostDashboardSeq)
  implicit val formatDashboardInfo: RootJsonFormat[DashboardContent] = jsonFormat9(DashboardContent)


  implicit val formatPostRelGroupView: RootJsonFormat[PostRelGroupView] = jsonFormat3(PostRelGroupView)
  implicit val formatPutRelGroupView: RootJsonFormat[PutRelGroupView] = jsonFormat4(PutRelGroupView)
  implicit val formatPostRelGroupViewSeq: RootJsonFormat[PostRelGroupViewSeq] = jsonFormat1(PostRelGroupViewSeq)
  implicit val formatPutRelGroupViewSeq: RootJsonFormat[PutRelGroupViewSeq] = jsonFormat1(PutRelGroupViewSeq)

  implicit val formatView: RootJsonFormat[View] = jsonFormat15(View)
  implicit val formatPostViewInfo: RootJsonFormat[View4Post] = jsonFormat9(View4Post)
  implicit val formatPutViewInfo: RootJsonFormat[View4Put] = jsonFormat10(View4Put)
  implicit val formatQUeryView: RootJsonFormat[QueryView] = jsonFormat12(QueryView)
  implicit val formatPostViewInfoSeq: RootJsonFormat[View4PostSeq] = jsonFormat1(View4PostSeq)
  implicit val formatPutViewInfoSeq: RootJsonFormat[View4PutSeq] = jsonFormat1(View4PutSeq)

  implicit val formatCronJob: RootJsonFormat[CronJob] = jsonFormat13(CronJob)
  implicit val formatPostCronJob: RootJsonFormat[PostCronJob] =jsonFormat7(PostCronJob)
  implicit val formatPutCronJob: RootJsonFormat[PutCronJob] = jsonFormat8(PutCronJob)
  implicit val formatPostCronJobSeq: RootJsonFormat[PostCronJobSeq] =jsonFormat1(PostCronJobSeq)
  implicit val formatPutCronJobSeq: RootJsonFormat[PutCronJobSeq] =jsonFormat1(PutCronJobSeq)
  implicit val formatCronJobSeq: RootJsonFormat[CronJobSeq] =jsonFormat1(CronJobSeq)


  implicit val formatPostUploadMeta: RootJsonFormat[PostUploadMeta] = jsonFormat5(PostUploadMeta)

  implicit val formatLibWidget: RootJsonFormat[LibWidget] = jsonFormat9(LibWidget)
  implicit val formatQueryLibWidget: RootJsonFormat[QueryLibWidget] = jsonFormat5(QueryLibWidget)

  implicit val formatSqlInfo: RootJsonFormat[SQL] = jsonFormat1(SQL)

  implicit val formatLoginClass: RootJsonFormat[LoginClass] = jsonFormat2(LoginClass)

  implicit val formatChangePwdClass: RootJsonFormat[ChangePassword] = jsonFormat2(ChangePassword)

  implicit val formatChangeUserPwdClass: RootJsonFormat[ChangeUserPassword] = jsonFormat3(ChangeUserPassword)

  implicit val formatSessionClass: RootJsonFormat[SessionClass] = jsonFormat4(SessionClass)

  implicit val formatResponseHeader: RootJsonFormat[ResponseHeader] = jsonFormat3(ResponseHeader)

  implicit val formatBaseInfo: RootJsonFormat[BaseInfo] = jsonFormat2(BaseInfo)

  implicit val formatPutLoginUserInfo: RootJsonFormat[User4Login] = jsonFormat2(User4Login)

  implicit val formatViewResult: RootJsonFormat[ViewResult] = jsonFormat2(ViewResult)

  implicit val formatResponsePayload: RootJsonFormat[ResponsePayload] = jsonFormat1(ResponsePayload)

  implicit val formatKV: RootJsonFormat[KV] = jsonFormat2(KV)

  implicit val formatCascadeParent: RootJsonFormat[CascadeParent] = jsonFormat2(CascadeParent)

  implicit val formatDistinctRequest: RootJsonFormat[DistinctFieldValueRequest] = jsonFormat5(DistinctFieldValueRequest)


  implicit val formatWidgetWithPermission: RootJsonFormat[WidgetWithPermission] = jsonFormat12(WidgetWithPermission)

  implicit val formatManualInfo: RootJsonFormat[ManualInfo] = jsonFormat3(ManualInfo)

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


