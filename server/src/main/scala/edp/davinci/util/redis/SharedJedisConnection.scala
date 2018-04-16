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
import redis.clients.jedis.{JedisShardInfo, ShardedJedis, ShardedJedisPool}

import scala.collection.mutable.ListBuffer

object SharedJedisConnection extends Serializable {

  def createPool(hosts: Array[(String, Int)], password: Option[String], poolConfig: GenericObjectPoolConfig): ShardedJedisPool = {
    import collection.JavaConversions._
    val shards = ListBuffer.empty[JedisShardInfo]
    hosts.foreach(host => {
      val info = new JedisShardInfo(host._1, host._2)
      if (password.nonEmpty) info.setPassword(password.get)
      shards += info
    })
    new ShardedJedisPool(poolConfig, shards)
  }

  def getJedis(pool: ShardedJedisPool): ShardedJedis = {
    pool.getResource
  }

  def getList(sharedJedis: ShardedJedis, key: String): util.List[String] = {
    val value = sharedJedis.lrange(key, 0, -1)
    sharedJedis.close()
    value
  }

  def setKey(sharedJedis: ShardedJedis, key: String, resultSeq: Seq[String],expired:Int) = {
    resultSeq.foreach(sharedJedis.rpush(key,_))
    //    jedis.lpush(key, resultList: _*)
    sharedJedis.expire(key, expired)
    sharedJedis.close()
  }


  def getString(sharedJedis: ShardedJedis, key: String): String = {
    val value = sharedJedis.get(key)
    sharedJedis.close()
    value
  }

  def setKey(sharedJedis: ShardedJedis, key: String, resStr: String,expired:Int) = {
    sharedJedis.set(key,resStr)
    sharedJedis.expire(key,expired)
    sharedJedis.close()
  }

}
