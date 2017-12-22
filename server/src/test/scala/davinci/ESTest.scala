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

import java.util.Properties

import com.alibaba.druid.pool.{DruidDataSource, ElasticSearchDruidDataSourceFactory}

object ESTest {
  def main(args: Array[String]): Unit = {
    val properties = new Properties
    val testIndex = "test_mb_100"
    properties.put("url", "jdbc:elasticsearch://localhost:9300/" + testIndex)
    val dds: DruidDataSource = ElasticSearchDruidDataSourceFactory.createDataSource(properties).asInstanceOf[DruidDataSource]
    val connection = dds.getConnection
    val ps = connection.prepareStatement("SELECT event_id, col_int_a, col_time_b from  test_mb_100 where col_int_f < 10")
    val resultSet = ps.executeQuery
    val reMeta = resultSet.getMetaData
    println(reMeta.getColumnCount)
    for (i <- 1 until reMeta.getColumnCount)
      println(reMeta.getColumnLabel(i))
    while (resultSet.next) {
      for (i <- 0 until reMeta.getColumnCount)
        println(resultSet.getObject(i).getClass.getName + ">>>>>>>>>>>>>" + resultSet.getObject(i))
    }
    ps.close()
    connection.close()
    dds.close()
  }

}
