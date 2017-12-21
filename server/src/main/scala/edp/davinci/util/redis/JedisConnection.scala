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





package edp.davinci.util.redis

import java.util

import edp.davinci.ModuleInstance
import edp.davinci.rest.ViewResult
import edp.davinci.util.CommonUtils
import org.apache.commons.pool2.impl.GenericObjectPoolConfig
import org.apache.log4j.Logger

object JedisConnection extends Serializable {
  import scala.collection.JavaConversions._
  private lazy val logger = Logger.getLogger(this.getClass)
  private lazy val ADDR = ModuleInstance.getModule.config.getString("cache.url")
  private lazy val AUTH = ModuleInstance.getModule.config.getString("cache.auth")
  private lazy val MODE = ModuleInstance.getModule.config.getString("cache.mode")
  private lazy val MAX_TOTAL = 10
  private lazy val MAX_IDLE = 200
  private lazy val MAX_WAIT = 10000
  private lazy val TIMEOUT = 10000
  private lazy val TEST_ON_BORROW = true
  lazy val EXPIRE: Int = ModuleInstance.getModule.config.getInt("cache.expire")

  val config = new GenericObjectPoolConfig()
  config.setMaxIdle(MAX_IDLE)
  config.setMaxTotal(MAX_TOTAL)
  config.setMaxWaitMillis(MAX_WAIT)
  config.setTestOnBorrow(TEST_ON_BORROW)


  val hosts: Array[(String, Int)] = {
    ADDR.split(",").map(host => {
      val ip2port = host.split(":")
      (ip2port(0), ip2port(1).toInt)
    })
  }

  private lazy val password = if ("" == AUTH) None else Some(AUTH)
  private lazy val jedisPool = if (MODE == "stand-alone") StandAloneConnection.createPool(hosts, password, config) else null
  private lazy val jedisCluster = if (MODE == "cluster") JedisClusterConnection.createPool(hosts, password, config) else null
  private lazy val sharedPool = if (MODE == "shared") SharedJedisConnection.createPool(hosts, password, config) else null


  def getList(key: String): util.List[String] = {
    MODE match {
      case "stand-alone" => StandAloneConnection.getList(jedisPool.getResource, key)
      case "cluster" => JedisClusterConnection.getList(jedisCluster, key)
      case "shared" => SharedJedisConnection.getList(sharedPool.getResource, key)
      case _ => new util.ArrayList[String]()
    }
  }

  def set(key: String, result: List[String], expired: Int): Unit = {
    MODE match {
      case "stand-alone" => StandAloneConnection.setKey(jedisPool.getResource, key, result, expired)
      case "cluster" => JedisClusterConnection.setKey(jedisCluster, key, result,expired )
      case "shared" => SharedJedisConnection.setKey(sharedPool.getResource, key, result,expired)
      case _ => logger.warn("not supported mode!!!")
    }
  }

  def getStr(key: String): util.List[String] = {
    MODE match {
      case "stand-alone" => StandAloneConnection.getList(jedisPool.getResource, key)
      case "cluster" => JedisClusterConnection.getList(jedisCluster, key)
      case "shared" => SharedJedisConnection.getList(sharedPool.getResource, key)
      case _ => new util.ArrayList[String]()
    }
  }

  def set(key: String, result: String,expired:Int) = {
    MODE match {
      case "stand-alone" => StandAloneConnection.setKey(jedisPool.getResource, key, result,expired)
      case "cluster" => JedisClusterConnection.setKey(jedisCluster, key, result,expired)
      case "shared" => SharedJedisConnection.setKey(sharedPool.getResource, key, result,expired)
      case _ => logger.warn("not supported mode!!!")
    }
  }


}


