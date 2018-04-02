package edp.davinci.rest.cronjob

import cn.hutool.extra.mail.MailAccount
import edp.davinci.module.ConfigurationModuleImpl
import edp.davinci.persistence.entities.CronJob

object EmailService {
  private lazy val SMTP_HOST = ConfigurationModuleImpl.config.getString("mail.host")
  private lazy val SMTP_PORT = ConfigurationModuleImpl.config.getInt("mail.port")
  private lazy val SMTP_AUTH = ConfigurationModuleImpl.config.getBoolean("mail.startttlsEnable")
  private lazy val SMTP_FROM = ConfigurationModuleImpl.config.getString("mail.from")
  private lazy val SMTP_USER = ConfigurationModuleImpl.config.getString("mail.user")
  private lazy val SMTP_PASSWORD = ConfigurationModuleImpl.config.getString("mail.pass")
  private val account = new MailAccount
  account.setHost(SMTP_HOST)
  account.setPort(SMTP_PORT)
  account.setAuth(SMTP_AUTH)
  account.setFrom(SMTP_FROM)
  account.setUser(SMTP_USER)
  account.setPass(SMTP_PASSWORD)


  def sendEmailWithImage(cronJob: CronJob): Unit = {
    import cn.hutool.core.collection.CollUtil
    import cn.hutool.extra.mail.MailUtil

    MailUtil.send(account, CollUtil.newArrayList("hutool@foxmail.com"), "测试", "邮件来自Hutool测试", false)
  }
}


