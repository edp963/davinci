package edp.davinci.util.jdbc

import java.sql.{Connection, DriverManager}

import org.apache.log4j.Logger

object HiveConnection {
  private lazy val logger = Logger.getLogger(this.getClass)

  def getConnection(jdbcUrl: String, user: String, password: String): Connection = {
    try {
      Class.forName("org.apache.hive.jdbc.HiveDriver")
    } catch {
      case e:Throwable =>
        logger.error("hive connection", e)
    }
    DriverManager.getConnection(jdbcUrl, user, password)
  }

}
