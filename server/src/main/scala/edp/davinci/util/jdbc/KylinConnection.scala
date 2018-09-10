package edp.davinci.util.jdbc

import java.sql.Connection
import java.util.Properties

import org.apache.kylin.jdbc.Driver

object KylinConnection {

  def getConnection(jdbcUrl: String, user: String, password: String): Connection = {
    val driver: Driver = Class.forName("org.apache.kylin.jdbc.Driver").newInstance.asInstanceOf[Driver]
    val tmpJdbcUrl = jdbcUrl.toLowerCase
    val info = new Properties()
    info.put("user", user)
    info.put("password", password)
    driver.connect(tmpJdbcUrl, info)
  }

}
