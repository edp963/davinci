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





package edp.davinci.rest

import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.{Directives, Route}
import edp.davinci.persistence.base._
import edp.davinci.persistence.entities._
import edp.davinci.util.common.ResponseUtils._
import edp.davinci.util.common.AuthorizationProvider
import edp.davinci.util.json.JsonProtocol._
import slick.jdbc.MySQLProfile.api._

import scala.concurrent.Future
import scala.util.{Failure, Success}


trait BaseRoutes {


  def getByIdRoute(route: String): Route

  def getByNameRoute(route: String): Route

  def getByAllRoute(route: String): Route

  def deleteByIdRoute(route: String): Route

}

class BaseRoutesImpl[T <: BaseTable[A], A <: BaseEntity](baseDal: BaseDal[T, A]) extends BaseRoutes with Directives {


  override def getByIdRoute(route: String): Route = path(route / LongNumber) {
    id =>
      get {
        authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
          session => getByIdComplete(route, id, session)
        }
      }
  }

  override def getByNameRoute(route: String): Route = path(route / Segment) {
    name =>
      get {
        authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
          session => getByNameComplete(route, name, session)
        }

      }
  }


  override def getByAllRoute(route: String): Route = path(route) {
    get {
      authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
        session => getByAllComplete(route, session, getByAll(session))
      }
    }
  }


  override def deleteByIdRoute(route: String): Route = path(route / LongNumber) {
    id =>
      delete {
        authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
          session => deleteByIdComplete(id, session)
        }
      }
  }


  def getByIdComplete(route: String, id: Long, session: SessionClass): Route = {
    onComplete(baseDal.findById(id)) {
      case Success(baseEntityOpt) => baseEntityOpt match {
        case Some(baseEntity) => complete(OK, ResponseJson[BaseEntity](getHeader(200, session), baseEntity))
        case None => complete(BadRequest, ResponseJson[String](getHeader(400, "not found", session), ""))
      }
      case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
    }
  }


  def getByNameComplete(route: String, name: String, session: SessionClass): Route = {
    if (session.admin || access(route, "name"))
      onComplete(baseDal.findByName(name)) {
        case Success(baseEntityOpt) => baseEntityOpt match {
          case Some(baseEntity) => complete(OK, ResponseJson[BaseEntity](getHeader(200, session), baseEntity))
          case None => complete(BadRequest, getHeader(404, session))
        }
        case Failure(ex) => complete(BadRequest, getHeader(402, ex.getMessage, session))
      } else complete(Forbidden, getHeader(403, session))
  }


  def getByAll(session: SessionClass): Future[Seq[BaseInfo]] = baseDal.findAll(_.active === true)


  def getAllByGroupId(session: SessionClass): Future[Seq[BaseInfo]] = baseDal.findAll(obj => obj.active === true)


  def getByAllComplete(route: String, session: SessionClass, future: Future[Seq[BaseInfo]]): Route = {
    if (session.admin || access(route, "all")) {
      onComplete(future) {
        case Success(baseSeq) => complete(OK, ResponseSeqJson[BaseInfo](getHeader(200, session), baseSeq))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  def postComplete(session: SessionClass, seq: Seq[SimpleBaseEntity]): Route = {
    if (session.admin) {
      onComplete(insertByPost(session, seq).mapTo[Seq[BaseEntity]]) {
        case Success(baseSeq) => complete(OK, ResponseSeqJson[BaseEntity](getHeader(200, session), baseSeq))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }


  def insertByPost(session: SessionClass, seq: Seq[SimpleBaseEntity]): Future[Seq[BaseEntity]] = {
    val entitySeq = seq.map(generateEntity(_, session))
    baseDal.insert(entitySeq.asInstanceOf[Seq[A]])
  }


  def putComplete(session: SessionClass, seq: Seq[SimpleBaseEntity]): Route = {
    if (session.admin) {
      onComplete(baseDal.update(seq.asInstanceOf[Seq[A]])) {
        case Success(_) => complete(OK, getHeader(200, session))
        case Failure(ex) => complete(BadRequest, getHeader(500, ex.getMessage, session))
      }
    }
    else complete(Forbidden, getHeader(403, session))
  }


  def deleteByIdComplete(id: Long, session: SessionClass): Route = {
    if (session.admin) {
      onComplete(baseDal.deleteById(id).mapTo[Int]) {
        case Success(r) => complete(OK, ResponseJson[Int](getHeader(200, session), r))
        case Failure(ex) => complete(BadRequest, ResponseJson[String](getHeader(400, ex.getMessage, session), ""))
      }
    } else complete(Forbidden, ResponseJson[String](getHeader(403, session), ""))
  }

  //  override def deleteByBatchRoute(route: String): Route = path(route) {
  //    delete {
  //      entity(as[String]) {
  //        idStr => {
  //          authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
  //            val ids = idStr.split(",").map(_.toLong)
  //            session => deleteByBatchComplete(ids, session)
  //          }
  //        }
  //      }
  //    }
  //  }

  //  override def paginateRoute(route: String, column: String): Route = path(route) {
  //    get {
  //      authenticateOAuth2Async[SessionClass]("davinci", AuthorizationProvider.authorize) {
  //        session =>
  //          parameters('page.as[Int], 'size.as[Int] ? 20) { (offset, limit) =>
  //            val future = baseDal.paginate(_.active === true)(offset, limit).mapTo[Seq[BaseEntity]]
  //            getByAllComplete(route, session, future)
  //          }
  //      }
  //    }
  //  }


  //  def deleteByBatchComplete(ids: Seq[Long], session: SessionClass): Route = {
  //    if (session.admin) {
  //      onComplete(baseDal.deleteById(ids).mapTo[Int]) {
  //        case Success(_) => complete(OK, getHeader(200, session))
  //        case Failure(ex) => complete(InternalServerError, getHeader(500, ex.getMessage, session))
  //      }
  //    } else complete(Forbidden, getHeader(403, session))
  //
  //  }


  //  def generateEntity(simple: SimpleBaseEntity, session: SessionClass): BaseEntity = {
  //    simple match {
  //      case bizLogic: SimpleBizlogic => Bizlogic(0, bizLogic.source_id, bizLogic.name, bizLogic.desc, bizLogic.active, currentTime, session.userId, currentTime, session.userId)
  //      case dashboard: SimpleDashboard => Dashboard(0, dashboard.name, dashboard.desc, dashboard.publish, active = true, currentTime, session.userId, currentTime, session.userId)
  //      case group: SimpleGroup => Group(0, group.name, group.desc, active = true, currentTime, session.userId, currentTime, session.userId)
  //      case libWidget: SimpleLibWidget => LibWidget(0, libWidget.`type`, active = true, currentTime, session.userId, currentTime, session.userId)
  //      case source: SimpleSource => Source(0, source.group_id, source.name, source.desc, source.`type`, source.config, active = true, currentTime, session.userId, currentTime, session.userId)
  //      case sql: SimpleSql => Sql(0, sql.bizlogic_id, sql.name, sql.sql_type, sql.sql_tmpl, sql.sql_order, sql.desc, active = true, currentTime, session.userId, currentTime, session.userId)
  //      case sqlLog: SimpleSqlLog => SqlLog(0, sqlLog.sql_id, session.userId, sqlLog.start_time, sqlLog.end_time, active = true, sqlLog.success, sqlLog.error)
  //      case user: SimpleUserSeq => User(0, user.email, "123456", user.title, user.name, admin = false, active = true, currentTime, session.userId, currentTime, session.userId)
  //      case widget: SimpleWidget => Widget(0, widget.widgetlib_id, widget.bizlogic_id, widget.name, widget.desc, widget.trigger_type, widget.trigger_params, widget.publish, active = true, currentTime, session.userId, currentTime, session.userId)
  //    }
  //  }


  def generateEntity(simple: SimpleBaseEntity, session: SessionClass): BaseEntity = {
    simple match {
      case group: Group4Post => UserGroup(0, group.name, Some(group.desc), active = true, null, session.userId, null, session.userId)
      case libWidget: SimpleLibWidget => LibWidget(0, libWidget.name, libWidget.params, libWidget.`type`, libWidget.active, libWidget.create_time, libWidget.create_by, libWidget.update_time, libWidget.update_by)
      case source: Source4Post => Source(0, source.name, source.connection_url, source.desc, source.`type`, source.config, active = true, null, session.userId, null, session.userId)
      case sqlLog: SimpleSqlLog => SqlLog(0, sqlLog.user_id, sqlLog.user_email, sqlLog.sql, sqlLog.start_time, sqlLog.end_time, sqlLog.success, sqlLog.error)
      case user: User4Post => User(0, user.email, user.password, user.title, user.name, user.admin, active = true, null, session.userId, null, session.userId)
      //      case widget: PostWidgetInfo => Widget(0, widget.widgetlib_id, widget.bizlogic_id, widget.name, Some(widget.olap_sql), widget.desc, widget.trigger_type, widget.trigger_params, Some(widget.chart_params), widget.publish, active = true, null, session.userId, null, session.userId)
      //      case relDashboardWidget: PostRelDashboardWidget => RelDashboardWidget(0, relDashboardWidget.dashboard_id, relDashboardWidget.widget_id, relDashboardWidget.position_x, relDashboardWidget.position_y, relDashboardWidget.length, relDashboardWidget.width,
      //        active = true, null, session.userId, null, session.userId)
    }
  }

  def access(route: String, `type`: String): Boolean = route match {
    case "groups" | "widgets" | "dashboards" | "bizlogics" => true
    case "users" => `type` match {
      case "id" => true
      case "name" => true
      case "all" => false
    }
    case _ => false
  }


  //  def paginateFilter(filter: String, session: SessionClass, column: String): Future[Seq[BaseEntity]] = {
  //    val (offset, limit) = paginateInfo(filter)
  //    val future = column match {
  //      case "domain_id" => baseDal.paginate(table => table.domain_id === session.domainId && table.active === true)(offset, limit).mapTo[Seq[BaseEntity]]
  //      case "id" => baseDal.paginate(_.active === true)(offset, limit).mapTo[Seq[BaseEntity]]
  //    }
  //    future
  //  }
  //
  //
  //
  //  def paginateInfo(filter: String): (Int, Int) = {
  //    val pattern = new Regex("""\d+""")
  //    val array = pattern.findAllIn(filter).toArray
  //    val page = array(0).toInt
  //    val size = array(1).toInt
  //    ((page - 1) * size + 1, size)
  //  }


}
