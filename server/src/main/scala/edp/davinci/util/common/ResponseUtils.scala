package edp.davinci.util.common

import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.server.Directive0
import akka.http.scaladsl.server.directives.RespondWithDirectives.respondWithHeader
import edp.davinci.rest.{ResponseHeader, SessionClass}
import edp.davinci.util.common.DateUtils.yyyyMMddHHmmssToString
import edp.davinci.util.json.JwtSupport
import edp.davinci.util.json.JwtSupport.generateToken

object ResponseUtils {

  def responseHeaderWithToken(session: SessionClass): Directive0 = {
    respondWithHeader(RawHeader("token", JwtSupport.generateToken(session)))
  }

  def currentTime: String = yyyyMMddHHmmssToString(DateUtils.currentyyyyMMddHHmmss, DtFormat.TS_DASH_SEC)

  val msgmap = Map(200 -> "Success", 404 -> "Not found", 401 -> "Unauthorized", 403 -> "User not admin", 500 -> "Internal server error")

  def getHeader(code: Int, session: SessionClass): ResponseHeader = {
    if (session != null)
      ResponseHeader(code, msgmap(code), generateToken(session))
    else
      ResponseHeader(code, msgmap(code))
  }

  def getHeader(code: Int, msg: String, session: SessionClass): ResponseHeader = {
    if (session != null)
      ResponseHeader(code, msg, generateToken(session))
    else
      ResponseHeader(code, msg)
  }
}
