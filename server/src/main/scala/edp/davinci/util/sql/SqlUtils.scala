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


package edp.davinci.util.sql

import java.sql.Types._
import java.sql.{Connection, ResultSet}
import java.util.TimeZone
import java.util.regex.Pattern

import com.zaxxer.hikari.{HikariConfig, HikariDataSource}
import edp.davinci.module.ConfigurationModuleImpl
import edp.davinci.persistence.entities.PostUploadMeta
import edp.davinci.rest.{CascadeParent, DistinctFieldValueRequest}
import edp.davinci.util.common.DateUtils
import edp.davinci.util.common.DavinciConstants._
import edp.davinci.util.jdbc.{ESConnection, HiveConnection}
import org.apache.log4j.Logger

import scala.collection.mutable


object SqlUtils extends Serializable {
  lazy val dataSourceMap: mutable.HashMap[(String, String), HikariDataSource] = new mutable.HashMap[(String, String), HikariDataSource]
  private lazy val logger = Logger.getLogger(this.getClass)
  private lazy val maximumPoolSize = ConfigurationModuleImpl.config.getInt("source.maximumPoolSize")
  private lazy val minimumIdle = ConfigurationModuleImpl.config.getInt("source.minimumIdle")
  private lazy val idleTimeout = ConfigurationModuleImpl.config.getInt("source.idleTimeout")
  private lazy val maxLifetime = ConfigurationModuleImpl.config.getInt("source.maxLifetime")

  def getConnection(jdbcUrl: String, username: String, password: String, maxPoolSize: Int = 10): Connection = {
    val tmpJdbcUrl = jdbcUrl.toLowerCase
    if (tmpJdbcUrl.indexOf("elasticsearch") > -1)
      ESConnection.getESJDBCConnection(tmpJdbcUrl, username)
    else {
      if (tmpJdbcUrl.indexOf("hive") > -1 && tmpJdbcUrl.indexOf("presto") == -1)
        HiveConnection.getConnection(tmpJdbcUrl, username, password)
      else {
        if (!dataSourceMap.contains((tmpJdbcUrl, username)) || dataSourceMap((tmpJdbcUrl, username)) == null) {
          synchronized {
            if (!dataSourceMap.contains((tmpJdbcUrl, username)) || dataSourceMap((tmpJdbcUrl, username)) == null) {
              initJdbc(jdbcUrl, username, password, maxPoolSize)
            }
          }
        }
        dataSourceMap((tmpJdbcUrl, username)).getConnection
      }
    }
  }

  private def initJdbc(jdbcUrl: String, username: String, password: String, muxPoolSize: Int = 10): Unit = {
    println(jdbcUrl)
    val config = new HikariConfig()
    val tmpJdbcUrl = jdbcUrl.toLowerCase
    if (tmpJdbcUrl.indexOf("mysql") > -1) {
      println("mysql")
      config.setConnectionTestQuery("SELECT 1")
      config.setDriverClassName("com.mysql.jdbc.Driver")
    } else if (tmpJdbcUrl.indexOf("oracle") > -1) {
      println("oracle")
      config.setConnectionTestQuery("SELECT 1 from dual ")
      config.setDriverClassName("oracle.jdbc.driver.OracleDriver")
    } else if (tmpJdbcUrl.indexOf("sqlserver") > -1) {
      println("sqlserver")
      config.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver")
    } else if (tmpJdbcUrl.indexOf("h2") > -1) {
      println("h2")
      config.setDriverClassName("org.h2.Driver")
    } else if (tmpJdbcUrl.indexOf("phoenix") > -1) {
      println("hbase phoenix")
      config.setDriverClassName("org.apache.phoenix.jdbc.PhoenixDriver")
    } else if (tmpJdbcUrl.indexOf("mongodb") > -1) {
      println("mongodb")
      config.setDriverClassName("mongodb.jdbc.MongoDriver")
    } else if (tmpJdbcUrl.indexOf("sql4es") > -1) {
      println("elasticSearch")
      config.setDriverClassName("nl.anchormen.sql4es.jdbc.ESDriver")
    } else if (tmpJdbcUrl.indexOf("presto") > -1) {
      println("presto")
      TimeZone.setDefault(TimeZone.getTimeZone("Asia/Shanghai"))
      config.setDriverClassName("com.facebook.presto.jdbc.PrestoDriver")
    } else if (tmpJdbcUrl.indexOf("moonbox") > -1) {
      println("moonbox")
      config.setDriverClassName("moonbox.jdbc.MbDriver")
    } else if (tmpJdbcUrl.indexOf("cassandra") > -1) {
      println("cassandra")
      config.setDriverClassName("com.github.adejanovski.cassandra.jdbc.CassandraDriver")
    } else if (tmpJdbcUrl.indexOf("kylin") > -1) {
      println("kylin")
      config.setDriverClassName("org.apache.kylin.jdbc.Driver")
    }

    if (tmpJdbcUrl.indexOf("sql4es") > -1)
      config.setUsername(null)
    else
      config.setUsername(username)
    if (tmpJdbcUrl.indexOf("presto") > -1 || tmpJdbcUrl.indexOf("sql4es") > -1)
      config.setPassword(null)
    else
      config.setPassword(password)


    config.setJdbcUrl(jdbcUrl)
    config.setMaxLifetime(maxLifetime)
    config.setIdleTimeout(idleTimeout)
    config.setMaximumPoolSize(maximumPoolSize)
    config.setMinimumIdle(minimumIdle)

    //    config.addDataSourceProperty("cachePrepStmts", "true")
    //    config.addDataSourceProperty("prepStmtCacheSize", "250")
    //    config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048")

    val ds: HikariDataSource = new HikariDataSource(config)
    println(tmpJdbcUrl + "$$$$$$$$$$$$$$$$$" + ds.getUsername + " " + ds.getPassword)
    dataSourceMap((tmpJdbcUrl, username)) = ds
  }

  def resetConnection(jdbcUrl: String, username: String, password: String): Unit = {
    shutdownConnection(jdbcUrl.toLowerCase, username)
    getConnection(jdbcUrl, username, password).close()
  }

  def shutdownConnection(jdbcUrl: String, username: String): dataSourceMap.type = {
    val tmpJdbcUrl = jdbcUrl.toLowerCase
    dataSourceMap((tmpJdbcUrl, username)).close()
    dataSourceMap -= ((tmpJdbcUrl, username))
  }


  def getRow(rs: ResultSet, isES: Boolean): Seq[String] = {
    val meta = rs.getMetaData
    val columnNum = meta.getColumnCount
    (1 to columnNum).map(columnIndex => {
      val valueIndex = if (isES) columnIndex - 1 else columnIndex
      val fieldValue = meta.getColumnType(columnIndex) match {
        case BIGINT => rs.getLong(valueIndex)
        case DECIMAL => rs.getBigDecimal(valueIndex)
        case NUMERIC => rs.getBigDecimal(valueIndex)
        case FLOAT => rs.getFloat(valueIndex)
        case DOUBLE => rs.getDouble(valueIndex)
        case REAL => rs.getDouble(valueIndex)
        case NVARCHAR => rs.getString(valueIndex)
        case VARCHAR => rs.getString(valueIndex)
        case LONGNVARCHAR => rs.getString(valueIndex)
        case LONGVARCHAR => rs.getString(valueIndex)
        case BOOLEAN => rs.getBoolean(valueIndex)
        case BIT => rs.getBoolean(valueIndex)
        case BINARY => rs.getBytes(valueIndex)
        case VARBINARY => rs.getBytes(valueIndex)
        case LONGVARBINARY => rs.getBytes(valueIndex)
        case TINYINT => rs.getShort(valueIndex)
        case SMALLINT => rs.getShort(valueIndex)
        case DATE => rs.getDate(valueIndex)
        case TIMESTAMP => rs.getTimestamp(valueIndex)
        case BLOB => rs.getBlob(valueIndex)
        case CLOB => rs.getClob(valueIndex)
        case ARRAY =>
          throw new RuntimeException("ResultSetSerializer not yet implemented for SQL type ARRAY")
        case STRUCT =>
          throw new RuntimeException("ResultSetSerializer not yet implemented for SQL type STRUCT")
        case DISTINCT =>
          throw new RuntimeException("ResultSetSerializer not yet implemented for SQL type DISTINCT")
        case REF =>
          throw new RuntimeException("ResultSetSerializer not yet implemented for SQL type REF")
        case JAVA_OBJECT => rs.getObject(valueIndex)
        case _ => rs.getObject(valueIndex)
      }
      if (fieldValue == null) null.asInstanceOf[String] else fieldValue.toString
    })
  }


  def str2dbType(fieldType: String): Int = fieldType.toUpperCase match {
    case "INT" => java.sql.Types.INTEGER
    case "BIGINT" => java.sql.Types.BIGINT
    case "VARCHAR" => java.sql.Types.VARCHAR
    case "NVARCHAR" => java.sql.Types.NVARCHAR
    case "LONGVARCHAR" => java.sql.Types.LONGVARCHAR
    case "LONGNVARCHAR" => java.sql.Types.LONGNVARCHAR
    case "FLOAT" => java.sql.Types.FLOAT
    case "DOUBLE" => java.sql.Types.DOUBLE
    case "REAL" => java.sql.Types.REAL
    case "DECIMAL" => java.sql.Types.DECIMAL
    case "NUMERIC" => java.sql.Types.NUMERIC
    case "BOOLEAN" => java.sql.Types.BOOLEAN
    case "BIT" => java.sql.Types.BIT
    case "BINARY" => java.sql.Types.BINARY
    case "VARBINARY" => java.sql.Types.VARBINARY
    case "LONGVARBINARY" => java.sql.Types.LONGVARBINARY
    case "DATE" => java.sql.Types.DATE
    case "DATETIME" => java.sql.Types.TIMESTAMP
    case "TIMESTAMP" => java.sql.Types.TIMESTAMP
    case "BLOB" => java.sql.Types.BLOB
    case "CLOB" => java.sql.Types.CLOB
    case "CHAR" => java.sql.Types.CHAR
    case _ => throw new UnsupportedOperationException(s"Unknown Type: $fieldType")
  }


  def str2MysqlType(fieldType: String): String = fieldType.toUpperCase match {
    case "INT" => "INTEGER"
    case "BIGINT" => "BIGINT(20)"
    case "VARCHAR" => "VARCHAR(1000)"
    case "NVARCHAR" => "NVARCHAR(2000)"
    case "LONGVARCHAR" => "LONGVARCHAR(2000)"
    case "LONGNVARCHAR" => "LONGNVARCHAR(2000)"
    case "FLOAT" => "FLOAT"
    case "DOUBLE" => "DOUBLE"
    case "REAL" => "REAL"
    case "DECIMAL" => "DECIMAL(17,3)"
    case "NUMERIC" => "NUMERIC(17,3)"
    case "BOOLEAN" => "TINYINT(1)"
    case "BIT" => "BIT(8)"
    case "BINARY" => "BINARY(128)"
    case "VARBINARY" => "VARBINARY(128)"
    case "LONGVARBINARY" => "LONGVARBINARY(128)"
    case "DATE" => "DATE"
    case "DATETIME" => "DATETIME"
    case "TIMESTAMP" => "TIMESTAMP"
    case "BLOB" => "BLOB"
    case "CLOB" => "CLOB"
    case "CHAR" => "CHAR(1)"
    case _ => throw new UnsupportedOperationException(s"Unknown Type: $fieldType")
  }


  def s2dbValue(strType: String, value: String): Any = if (value == null || value == "") null
  else strType.toUpperCase match {
    case "INT" |"TINYINT" => value.trim.toInt
    case "BIGINT" => value.trim.toLong
    case "VARCHAR" | "NVARCHAR" | "LONGVARCHAR" | "LONGNVARCHAR" | "BLOB" | "CLOB" | "CHAR" => value.trim
    case "FLOAT" => value.trim.toFloat
    case "DOUBLE" => value.trim.toDouble
    case "DECIMAL" => if ("" == value) new java.math.BigDecimal("0.0").stripTrailingZeros()
    else new java.math.BigDecimal(value.trim).stripTrailingZeros()
    case "BOOLEAN" => value.trim.toBoolean
    case "BINARY" | "VARBINARY" | "LONGVARBINARY" => value.trim.getBytes
    case "DATE" => DateUtils.dt2sqlDate(value.trim)
    case "DATETIME" | "TIMESTAMP" => DateUtils.dt2timestamp(value.trim)
    case _ => throw new UnsupportedOperationException(s"Unknown Type: $strType")
  }


  def getInsertSql(fieldName: List[String], tableName: String): String = {
    val placeholders = (1 to fieldName.size).map(_ => "?").mkString("(", ",", ")")
    val insertSql = s"INSERT INTO $tableName ${fieldName.map(field => s"`$field`").mkString("(", ",", ")")} values $placeholders"
    //    logger.info("@INSERT SQL:" + insertSql)
    insertSql
  }

  def getCreateSql(schemaMap: mutable.HashMap[String, (String, Int)], uploadMeta: PostUploadMeta): Set[String] = {
    val fieldNames = schemaMap.map(f => {
      if (f._2._1.contains("(") || f._2._1.contains(")")) s"`${f._1}` ${f._2._1}"
      else s"`${f._1}` ${str2MysqlType(f._2._1)}"
    }).mkString(",")

    val index = if (uploadMeta.index_keys.isEmpty) ""
    else ",INDEX " + uploadMeta.index_keys.get.split(",").mkString("_") + s" (${uploadMeta.index_keys.get})"

    val primaryKeys = if (uploadMeta.primary_keys.isEmpty) ""
    else s",PRIMARY KEY (${uploadMeta.primary_keys.get})"

    val dropSql = s"DROP TABLE IF EXISTS `${uploadMeta.table_name}`"
    val createSql = s"CREATE TABLE `${uploadMeta.table_name}` " + s"($fieldNames $primaryKeys $index) ENGINE=InnoDB  CHARACTER SET utf8;"
    val fullSql = Set(dropSql, createSql)
    logger.info("@CREATE TABLE SQL :")
    fullSql.foreach(println)
    fullSql
  }


  def getDeleteSql(uploadMeta: PostUploadMeta): String = {
    val tableName = uploadMeta.table_name
    val fieldNames = uploadMeta.primary_keys.get.split(",").toList
    val deleteSql = s"DELETE FROM `$tableName  WHERE " + fieldNames.map(key => s"`$key`=?").mkString(" AND ")
    logger.info("@DELETE sql " + deleteSql)
    deleteSql
  }


  def getDistinctSql(projectSql: String, distinctFieldValueRequest: DistinctFieldValueRequest): String = {
    val where = if (distinctFieldValueRequest.parents.nonEmpty) {
      val parents: Seq[CascadeParent] = distinctFieldValueRequest.parents.get
      parents.map(c => {
        val filedsSize = c.fieldValue.split(",").length
        val op = if (filedsSize > 1) " IN " else "="
        val fieldFormat = c.fieldValue.split(",").map(f =>s"""'$f'""").mkString("(", ",", ")")
        val value = if (filedsSize > 1) fieldFormat else s"""'${c.fieldValue}'"""
        c.fieldName + op + value
      }).mkString("WHERE ", " AND ", "")
    }
    else ""
    s"SELECT DISTINCT ${distinctFieldValueRequest.childFieldName} FROM ($projectSql) AS TbDistinct $where"
  }

  def filterAnnotation(sqlString: String): String = {
    val pattern = Pattern.compile("(?ms)('(?:''|[^'])*')|--.*?$|/\\*.*?\\*/")
    val result = pattern.matcher(sqlString).replaceAll("$1")
    logger.info(s"sql after filter>>>>>>>>>>>$result")
    result
  }

  def toArray(sql: String): Array[String] = {
    if (sql.lastIndexOf(sqlSeparator) == sql.length - 1) sql.dropRight(1).split(sqlSeparator)
    else sql.split(sqlSeparator)
  }


  def getDefaultVarMap(sql: String, varType: String): mutable.HashMap[String, List[String]] = {
    val sqlArray: Array[String] = toArray(sql)
    val defaultParams =
      if (varType == "group")
        sqlArray.filter(_.contains(groupVar))
      else
        sqlArray.filter(s => s.contains(queryVar) || s.contains(updateVar))
    val kvMap = mutable.HashMap.empty[String, List[String]]
    try {
      if (defaultParams.nonEmpty)
        defaultParams.foreach(g => {
          if (hasAssignmentChar(g)) {
            val k = getVarName(g)
            val v = getVarValue(g)
            kvMap(k) = List(v)
          }
        })
    } catch {
      case e: Throwable => logger.error("group var is not in right format!!!", e)
    }
    kvMap
  }


  private def getVarName(varDefined: String) = {
    varDefined.substring(varDefined.indexOf(dollarDelimiter) + 1, varDefined.lastIndexOf(dollarDelimiter)).trim
  }

  private def getVarValue(varDefined: String) = {
    varDefined.substring(varDefined.indexOf(assignmentChar) + 1).trim
  }

  private def hasAssignmentChar(varDefined: String) = {
    if (varDefined.indexOf(assignmentChar) > 0) true else false
  }

}
