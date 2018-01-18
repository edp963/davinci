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





package edp.davinci.util.json

import org.json4s.JsonAST.JNothing
import org.json4s._
import org.json4s.jackson.JsonMethods._
import org.json4s.jackson.Serialization._

object JsonUtils extends JsonUtils

trait JsonUtils {
  implicit var json4sFormats: Formats = DefaultFormats

  // Case Class related
  def json2caseClass[T: Manifest](json: String): T = read[T](json)

  def caseClass2json[T <: AnyRef](obj: T): String = write[T](obj)

  def jsonCompact(json: String): String = compact(render(parse(json)))

  def jsonPretty(json: String): String = pretty(render(parse(json)))

  // JValue related
  def json2jValue(json: String): JValue = parse(json) //parseJsonString

  def jValue2json(jValue: JValue): String = compact(render(jValue)) //jsonToString

  def containsName(jValue: JValue, name: String): Boolean = jValue \ name != JNothing

  def getString(jValue: JValue, name: String): String = (jValue \ name).extract[String]

  def getInt(jValue: JValue, name: String): Int = (jValue \ name).extract[Int]

  def getLong(jValue: JValue, name: String): Long = (jValue \ name).extract[Long]

  def getShort(jValue: JValue, name: String): Short = (jValue \ name).extract[Short]

  def getBoolean(jValue: JValue, name: String): Boolean = (jValue \ name).extract[Boolean]

  def getList(jValue: JValue, name: String): List[JValue] = (jValue \ name).extract[List[JValue]]

  def getJValue(jValue: JValue, name: String): JValue = (jValue \ name).extract[JValue]
}
