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





package edp.davinci.util.redis

import java.util

import org.apache.commons.pool2.impl.GenericObjectPoolConfig
import redis.clients.jedis._

object StandAloneConnection {


  def createPool(hosts: Array[(String, Int)], password: Option[String], poolConfig: GenericObjectPoolConfig): JedisPool = {
    if (password.nonEmpty) new JedisPool(poolConfig, hosts.head._1, hosts.head._2, 3000, password.get)
    else new JedisPool(poolConfig, hosts.head._1, hosts.head._2, 3000)
  }


  def getJedis(jedisPool: JedisPool): Jedis = {
    try {
      if (jedisPool != null) jedisPool.getResource
      else null
    } catch {
      case e: Exception => e.printStackTrace()
        null
    }
  }

  def setKey(jedis: Jedis, key: String, resultSeq: Seq[String], expired: Int): Unit = {
   resultSeq.foreach(jedis.rpush(key,_))
//    jedis.lpush(key, resultList: _*)
    jedis.expire(key, expired)
    jedis.close()
  }

  def getList(jedis: Jedis, key: String): util.List[String] = {
    val resultList = jedis.lrange(key, 0, -1)
    jedis.close()
    resultList
  }


  def getString(jedis: Jedis, key: String): String = {
    val value = jedis.get(key)
    jedis.close()
    value
  }

  def setKey(jedis: Jedis, key: String, resStr: String, expired: Int): Unit = {
    jedis.set(key, resStr)
    jedis.expire(key, expired)
    jedis.close()
  }
}

