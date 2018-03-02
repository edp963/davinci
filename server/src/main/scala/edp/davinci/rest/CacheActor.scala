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

import java.util.concurrent.TimeUnit

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.util.Timeout
import edp.davinci.util.common.DavinciConstants.requestTimeout
import edp.davinci.util.redis.JedisConnection
import org.apache.log4j.Logger

import scala.collection.mutable
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CacheActor extends Actor {
  private lazy val logger = Logger.getLogger(this.getClass)
  lazy val cacheMap = mutable.Map.empty[String, Future[Seq[String]]]

  override def receive: Receive = {
    case actorMessage: ActorMessage =>
      val sqls = actorMessage.sqlBuffer.mkString(";")
      if (cacheMap.contains(sqls)) {
        val futureFromMap: Future[Seq[String]] = cacheMap(sqls)
        logger.info("@@query from cacheMap")
        sender() ! futureFromMap
      }
      else {
        val resFuture: Future[Seq[String]] = Future(QueryHelper.executeQuery(actorMessage.sqlBuffer, actorMessage.sourceConfig)).mapTo[Seq[String]]
        cacheMap(sqls) = resFuture
        resFuture.onSuccess { case res =>
          cacheMap.remove(sqls)
          try {
            if (JedisConnection.getList(sqls).size() == 0 && actorMessage.expired > 0) {
              logger.info("update cache(*)(*)(*)(*)(*)")
              JedisConnection.set(sqls, res.toList, actorMessage.expired)
            }
          } catch {
            case e: Throwable => logger.error("write to redis exception", e)
              throw e
          }
        }
        resFuture.onFailure { case ex: Throwable =>
          cacheMap.remove(sqls)
          logger.error("CacheActor execute query", ex)
        }
        sender() ! resFuture
      }
  }

}

object ActorSys extends App {
  lazy val system = ActorSystem("cacheSystem")
  implicit val timeout = Timeout(requestTimeout, TimeUnit.SECONDS)
  private lazy val cacheRef = system.actorOf(Props[CacheActor], "cacheActor")

  def getActor: ActorRef = cacheRef
}
