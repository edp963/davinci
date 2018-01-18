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





package davinci

import edp.davinci.util.common.FileUtils
import edp.davinci.util.redis.JedisConnection

object JedisTest extends App {
import scala.collection.JavaConversions._
  val result = List(Seq("a", "b", "c"), Seq("1", "2", "3"))
  JedisConnection.set("maomao", result.map(FileUtils.covert2CSV),3 )
  JedisConnection.set("maomao", result.map(FileUtils.covert2CSV),3 )
  val getRes = JedisConnection.getStr("maomao").foreach(println)


  println(getRes)
}
