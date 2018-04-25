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

package edp.davinci.rest.cronjob

import java.io.{File, InputStreamReader, LineNumberReader}
import java.net.URLDecoder
import java.util.UUID
import java.util.concurrent.{ExecutorService, Executors, Future, TimeUnit}

import edp.davinci.ModuleInstance
import edp.davinci.module.ConfigurationModuleImpl
import edp.davinci.persistence.entities.{CronJob, EmailCronJobConfig}
import edp.davinci.rest.shares.ShareService
import edp.davinci.util.common.FileUtils
import edp.davinci.util.json.JsonUtils.json2caseClass
import javax.activation.FileDataSource
import org.apache.commons.mail.HtmlEmail
import org.apache.log4j.Logger

object EmailService {
  private lazy val logger = Logger.getLogger(this.getClass)
  private lazy val SMTP_HOST = ConfigurationModuleImpl.config.getString("mail.host")
  private lazy val SMTP_PORT = ConfigurationModuleImpl.config.getInt("mail.port")
  private lazy val SMTP_AUTH = ConfigurationModuleImpl.config.getBoolean("mail.startttlsEnable")
  private lazy val SMTP_FROM = ConfigurationModuleImpl.config.getString("mail.from")
  private lazy val SMTP_USER = ConfigurationModuleImpl.config.getString("mail.user")
  private lazy val SMTP_PASSWORD = ConfigurationModuleImpl.config.getString("mail.pass")

  private lazy val phantomHome = ConfigurationModuleImpl.config.getString("phantomjs_home")
  private lazy val phantomJsFile = FileUtils.dir+"/bin/phantom.js"


  def sendEmailWithImage(cronJob: CronJob): Unit = {
    val email = new HtmlEmail
    email.setHostName(SMTP_HOST)
    email.setSmtpPort(SMTP_PORT)
    email.setSSLCheckServerIdentity(SMTP_AUTH)
    email.setFrom(SMTP_FROM)
    email.setAuthentication(SMTP_USER, SMTP_PASSWORD)

    val emailCronJobConfig = json2caseClass[EmailCronJobConfig](cronJob.config)
    email.setSubject(emailCronJobConfig.subject)
    val to = emailCronJobConfig.to.split(";")
    to.foreach(email.addTo)
    if (emailCronJobConfig.cc.get != "") emailCronJobConfig.cc.get.split(";").foreach(email.addCc)
    if (emailCronJobConfig.bcc.get != "") emailCronJobConfig.bcc.get.split(";").foreach(email.addBcc)
    to.foreach(email.addTo)
    emailCronJobConfig.contentList.foreach(content => {
      val imgName = UUID.randomUUID() + ".png"
      val imgPath = FileUtils.dir + "/tempFiles/" + imgName
      val contentUrl = getContentUrl(cronJob.create_by, content.id, content.`type`)
      val result = phantomRender(contentUrl, imgPath)
      if (result == "1") {
        val ds = new FileDataSource(imgPath)
        val cid = email.embed(ds, imgName)
        val html = s"""<!DOCTYPE html><html lang="en"><head></head><body><img src='cid:$cid'/></body></html>"""
        logger.info(s"html $html")
        email.setHtmlMsg(html)
        logger.info(System.currentTimeMillis() + "after mail---------------------------")
      }
    })
    email.send()
  }

  private def getContentUrl(userId: Long, contentId: Long, contentType: String): String = {
    val modules = ModuleInstance.getModule
    lazy val host = modules.config.getString("httpServer.host")
    lazy val port = modules.config.getInt("httpServer.port")
    val shareInfo = ShareService.getShareURL(userId, contentId, "")
    val url = s"""http://$host:$port/share/#share?shareInfo=$shareInfo&type=$contentType"""
    logger.info(s"content url : $url")
    url
  }


  private def phantomRender(url: String, imgPath: String) = {

    val rendJsPath = URLDecoder.decode(phantomJsFile, "UTF-8")
    val cmd = Set(phantomHome, rendJsPath, url, imgPath).mkString(" ")
    logger.info("phantom command: " + cmd)
    val process = Runtime.getRuntime.exec(cmd)
    val ir = new InputStreamReader(process.getInputStream)
    val input = new LineNumberReader(ir)
    var line = input.readLine()
    try {
      while (line != null) {
        logger.info(line)
        line = input.readLine()
      }
      logger.info("Finished command " + cmd)
    } catch {
      case e: Exception =>
        logger.error("Error", e)
        process.destroy()
    }
    val result = checkFileExists(imgPath)
    process.destroy()
    logger.info(System.currentTimeMillis() + "close>>>>>>>>>>>>>>>>>>>>>")
    result
    //    process.destroy()

  }


  def checkFileExists(filePath: String) = {

    val task: TaskThread = new TaskThread(filePath)
    //实现Callable接口的任务线程类
    val exec: ExecutorService = Executors.newFixedThreadPool(1)
    //对task对象进行各种set操作以初始化任务
    val future: Future[String] = exec.submit(task)
    var result: String = null
    try {
      result = future.get(10 * 60 * 1000, TimeUnit.MILLISECONDS)
    }
    finally {
      if (result != "1") {
        task.exit = true
      }
      exec.shutdownNow
    }
    result
  }

}


