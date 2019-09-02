/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2019 EDP
 *  ==
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *        http://www.apache.org/licenses/LICENSE-2.0
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *  >>
 *
 */

package edp.core.utils;

import com.alibaba.druid.util.StringUtils;
import edp.core.common.jdbc.ESDataSource;
import edp.core.common.jdbc.ExtendedJdbcClassLoader;
import edp.core.common.jdbc.JdbcDataSource;
import edp.core.consts.Consts;
import edp.core.enums.DataTypeEnum;
import edp.core.exception.ServerException;
import edp.core.exception.SourceException;
import edp.core.model.CustomDataSource;
import edp.davinci.core.config.SpringContextHolder;
import edp.davinci.runner.LoadSupportDataSourceRunner;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.regex.Matcher;

import static edp.core.consts.Consts.*;

@Slf4j
public class SourceUtils {

    private JdbcDataSource jdbcDataSource;

    public SourceUtils(JdbcDataSource jdbcDataSource) {
        this.jdbcDataSource = jdbcDataSource;
    }

    /**
     * 获取数据源
     *
     * @param jdbcUrl
     * @param userename
     * @param password
     * @param database
     * @param version
     * @param isExt
     * @return
     * @throws SourceException
     */
    DataSource getDataSource(String jdbcUrl, String userename, String password, String database, String version, boolean isExt) throws SourceException {
        if (jdbcUrl.toLowerCase().contains(DataTypeEnum.ELASTICSEARCH.getDesc().toLowerCase())) {
            return ESDataSource.getDataSource(jdbcUrl, userename, password, jdbcDataSource);
        } else {
            return jdbcDataSource.getDataSource(jdbcUrl, userename, password, database, version, isExt);
        }
    }

    Connection getConnection(String jdbcUrl, String username, String password, String database, String version, boolean isExt) throws SourceException {
        DataSource dataSource = getDataSource(jdbcUrl, username, password, database, version, isExt);
        Connection connection = null;
        try {
            connection = dataSource.getConnection();
        } catch (Exception e) {
            connection = null;
        }
        try {
            if (null == connection || connection.isClosed()) {
                log.info("connection is closed, retry get connection!");
                releaseDataSource(jdbcUrl, username, password, version, isExt);
                dataSource = getDataSource(jdbcUrl, username, password, database, version, isExt);
                connection = dataSource.getConnection();
            }
        } catch (Exception e) {
            log.error("create connection error, jdbcUrl: {}", jdbcUrl);
            throw new SourceException("create connection error, jdbcUrl: " + jdbcUrl);
        }

        try {
            if (!connection.isValid(5)) {
                log.info("connection is invalid, retry get connection!");
                releaseDataSource(jdbcUrl, username, password, version, isExt);
                connection = null;
            }
        } catch (Exception e) {
        }

        if (null == connection) {
            try {
                dataSource = getDataSource(jdbcUrl, username, password, database, version, isExt);
                connection = dataSource.getConnection();
            } catch (SQLException e) {
                log.error("create connection error, jdbcUrl: {}", jdbcUrl);
                throw new SourceException("create connection error, jdbcUrl: " + jdbcUrl);
            }
        }

        return connection;
    }

    void releaseConnection(Connection connection) {
        if (null != connection) {
            try {
                connection.close();
                connection = null;
            } catch (Exception e) {
                e.printStackTrace();
                log.error("connection close error", e.getMessage());
            }
        }
    }


    public static void closeResult(ResultSet rs) {
        if (rs != null) {
            try {
                rs.close();
                rs = null;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public static boolean checkDriver(String dataSourceName, String jdbcUrl, String version, boolean isExt) {
        if (!StringUtils.isEmpty(dataSourceName) && LoadSupportDataSourceRunner.getSupportDatasourceMap().containsKey(dataSourceName)) {
            if (isExt && !StringUtils.isEmpty(version) && !JDBC_DATASOURCE_DEFAULT_VERSION.equals(version)) {
                String path = ((ServerUtils) SpringContextHolder.getBean(ServerUtils.class)).getBasePath()
                        + String.format(Consts.PATH_EXT_FORMATER, dataSourceName, version);
                ExtendedJdbcClassLoader extendedJdbcClassLoader = ExtendedJdbcClassLoader.getExtJdbcClassLoader(path);
                CustomDataSource dataSource = CustomDataSourceUtils.getInstance(jdbcUrl, version);
                try {
                    assert extendedJdbcClassLoader != null;
                    Class<?> aClass = extendedJdbcClassLoader.loadClass(dataSource.getDriver());
                    if (null == aClass) {
                        throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
                    }
                } catch (NullPointerException en) {
                    throw new ServerException("JDBC driver is not found: " + dataSourceName + ":" + version);
                } catch (ClassNotFoundException ex) {
                    throw new SourceException("Unable to get driver instance: " + jdbcUrl);
                }
            } else {
                if (DataTypeEnum.ELASTICSEARCH.getDesc().equals(dataSourceName)) {
                    return true;
                } else {
                    try {
                        String className = getDriverClassName(jdbcUrl, null);
                        Class<?> aClass = Class.forName(className);
                        if (null == aClass) {
                            throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
                        }
                    } catch (Exception e) {
                        throw new SourceException("Unable to get driver instance: " + jdbcUrl);
                    }
                }
            }
            return true;
        } else {
            throw new SourceException("Not supported data type: jdbcUrl=" + jdbcUrl);
        }
    }

    public static String isSupportedDatasource(String jdbcUrl) {
        String dataSourceName = getDataSourceName(jdbcUrl);
        if (StringUtils.isEmpty(dataSourceName)) {
            throw new SourceException("Not supported data type: jdbcUrl=" + jdbcUrl);
        }
        if (!LoadSupportDataSourceRunner.getSupportDatasourceMap().containsKey(dataSourceName)) {
            throw new SourceException("Not supported data type: jdbcUrl=" + jdbcUrl);
        }
        return dataSourceName;
    }

    public static String getDataSourceName(String jdbcUrl) {
        String dataSourceName = null;
        jdbcUrl = jdbcUrl.replaceAll(NEW_LINE_CHAR, EMPTY).replaceAll(SPACE, EMPTY).trim().toLowerCase();
        Matcher matcher = PATTERN_JDBC_TYPE.matcher(jdbcUrl);
        if (matcher.find()) {
            dataSourceName = matcher.group().split(COLON)[1];
        }
        return dataSourceName;
    }

    public static String getDriverClassName(String jdbcUrl, String version) {
        String className = null;
        try {
            className = DriverManager.getDriver(jdbcUrl.trim()).getClass().getName();
        } catch (SQLException e) {
        }
        if (StringUtils.isEmpty(className)) {
            DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
            CustomDataSource customDataSource = null;
            if (null == dataTypeEnum) {
                try {
                    customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl, version);
                } catch (Exception e) {
                    throw new SourceException(e.getMessage());
                }
            }

            if (null == dataTypeEnum && null == customDataSource) {
                throw new SourceException("Not supported data type: jdbcUrl=" + jdbcUrl);
            }
            className = null != dataTypeEnum && !StringUtils.isEmpty(dataTypeEnum.getDriver()) ? dataTypeEnum.getDriver() : customDataSource.getDriver().trim();
        }
        return className;
    }


    /**
     * 释放失效数据源
     *
     * @param jdbcUrl
     * @param username
     * @param password
     * @param dbVersion
     * @param isExt
     * @return
     */
    void releaseDataSource(String jdbcUrl, String username, String password, String dbVersion, boolean isExt) {
        if (jdbcUrl.toLowerCase().contains(DataTypeEnum.ELASTICSEARCH.getDesc().toLowerCase())) {
            ESDataSource.removeDataSource(jdbcUrl, username, password);
        } else {
            jdbcDataSource.removeDatasource(jdbcUrl, username, password, dbVersion, isExt);
        }
    }

    public static String getKey(String jdbcUrl, String username, String password, String version, boolean isExt) {
        StringBuilder sb = new StringBuilder();
        if (!StringUtils.isEmpty(username)) {
            sb.append(username);
        }
        if (!StringUtils.isEmpty(password)) {
            sb.append(Consts.COLON).append(password);
        }
        sb.append(Consts.AT_SYMBOL).append(jdbcUrl.trim());
        if (isExt && !StringUtils.isEmpty(version)) {
            sb.append(Consts.COLON).append(version);
        }

        return MD5Util.getMD5(sb.toString(), true, 64);
    }
}
