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

case class SessionClass(userId: Long, groupIdList: List[Long], admin: Boolean, currentTs: Long = System.currentTimeMillis())

case class BaseInfo(id: Long, name: String)

case class ManualInfo(adHoc: Option[String] = None, manualFilters: Option[String] = None, params: Option[List[KV]] = None)

case class Paginate(limit: Int, offset: Int, sortBy: String)

case class CacheClass(useCache: Boolean, expired: Int)

case class ViewResult(result: Seq[String] = null, totalCount: Long)

case class ResponsePayload(response: String)

case class RequestJson[A](payload: A)

case class RequestSeqJson[A](payload: Seq[A])

case class ResponseHeader(code: Int, msg: String, token: String = "")

case class ResponseJson[A](header: ResponseHeader, payload: A)

case class ResponseSeqJson[A](header: ResponseHeader, payload: Seq[A])
