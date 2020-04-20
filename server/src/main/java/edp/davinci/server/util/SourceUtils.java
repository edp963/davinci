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

package edp.davinci.server.util;

import static edp.davinci.server.commons.Constants.*;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;

import javax.sql.DataSource;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.MD5Utils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.server.component.jdbc.ExtendedJdbcClassLoader;
import edp.davinci.server.component.jdbc.JdbcDataSource;
import edp.davinci.server.enums.DataTypeEnum;
import edp.davinci.server.exception.SourceException;
import edp.davinci.server.model.CustomDataSource;
import edp.davinci.server.model.Dict;
import edp.davinci.server.model.JdbcSourceInfo;
import edp.davinci.server.runner.LoadSupportDataSourceRunner;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class SourceUtils {

    private JdbcDataSource jdbcDataSource;

    public SourceUtils(JdbcDataSource jdbcDataSource) {
        this.jdbcDataSource = jdbcDataSource;
    }

    /**
     * 获取数据源
     *
     * @param jdbcSourceInfo
     * @return
     * @throws SourceException
     */
	DataSource getDataSource(JdbcSourceInfo jdbcSourceInfo) throws SourceException {
		return jdbcDataSource.getDataSource(jdbcSourceInfo);
	}

    Connection getConnection(JdbcSourceInfo jdbcSourceInfo) throws SourceException {
        DataSource dataSource = getDataSource(jdbcSourceInfo);
        Connection connection = null;
        try {
            connection = dataSource.getConnection();
        } catch (Exception e) {

        }
        
        try {
            if (null == connection) {
                log.info("Connection is closed, retry get connection!");
                releaseDataSource(jdbcSourceInfo);
                dataSource = getDataSource(jdbcSourceInfo);
                connection = dataSource.getConnection();
            }
        } catch (Exception e) {
            log.error("Create connection error, jdbcUrl: {}", jdbcSourceInfo.getJdbcUrl());
            throw new SourceException("Create connection error, jdbcUrl: " + jdbcSourceInfo.getJdbcUrl());
        }

        try {
            if (!connection.isValid(5)) {
                log.info("Connection is invalid, retry get connection!");
                releaseDataSource(jdbcSourceInfo);
                connection = null;
            }
        } catch (Exception e) {

        }

        if (null == connection) {
            try {
                dataSource = getDataSource(jdbcSourceInfo);
                connection = dataSource.getConnection();
            } catch (SQLException e) {
                log.error("Create connection error, jdbcUrl: {}", jdbcSourceInfo.getJdbcUrl());
                throw new SourceException("Create connection error, jdbcUrl: " + jdbcSourceInfo.getJdbcUrl());
            }
        }

        return connection;
    }

    public static void releaseConnection(Connection connection) {
        if (null != connection) {
            try {
                connection.close();
                connection = null;
            } catch (Exception e) {
                e.printStackTrace();
                log.error("Connection close error", e.getMessage());
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
                log.error("ResultSet close error", e.getMessage());
            }
        }
    }

    public static boolean checkDriver(String dataSourceName, String jdbcUrl, String version, boolean isExt) {

    	if (StringUtils.isEmpty(dataSourceName) || !LoadSupportDataSourceRunner.getSupportDatasourceMap().containsKey(dataSourceName)) {
            throw new SourceException("Not supported data type, jdbcUrl: " + jdbcUrl);
        }
        
		if (isExt && !StringUtils.isEmpty(version) && !JDBC_DATASOURCE_DEFAULT_VERSION.equals(version)) {
			String path = System.getenv("DAVINCI_HOME") + File.separator
					+ String.format(PATH_EXT_FORMATER, dataSourceName, version);
			ExtendedJdbcClassLoader extendedJdbcClassLoader = ExtendedJdbcClassLoader.getExtJdbcClassLoader(path);
			CustomDataSource dataSource = CustomDataSourceUtils.getInstance(jdbcUrl, version);
			try {
				assert extendedJdbcClassLoader != null;
				Class<?> aClass = extendedJdbcClassLoader.loadClass(dataSource.getDriver());
				if (null == aClass) {
					throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
				}
			} catch (Exception ex) {
				throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
			}
		} else {
			if (DataTypeEnum.ELASTICSEARCH.getDesc().equals(dataSourceName) && !isExt) {
				return true;
			} else {
				try {
					String className = getDriverClassName(jdbcUrl, null);
					Class.forName(className);
				} catch (Exception e) {
					throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl, e);
				}
			}
		}
		return true;
    }

    public static String isSupportedDataSource(String jdbcUrl) {
        String dataSourceName = getDataSourceName(jdbcUrl);
        if (StringUtils.isEmpty(dataSourceName)) {
            throw new SourceException("Not supported data type: jdbcUrl=" + jdbcUrl);
        }
        if (!LoadSupportDataSourceRunner.getSupportDatasourceMap().containsKey(dataSourceName)) {
            throw new SourceException("Not supported data type: jdbcUrl=" + jdbcUrl);
        }

        String urlPrefix = String.format(JDBC_PREFIX_FORMATER, dataSourceName);
        String checkUrl = jdbcUrl.replaceFirst(DOUBLE_SLASH, EMPTY).replaceFirst(AT_SYMBOL, EMPTY);
        if (urlPrefix.equals(checkUrl)) {
            throw new SourceException("Communications link failure");
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
        
        if (!StringUtils.isEmpty(className) && !className.contains("com.sun.proxy")
                && !className.contains("net.sf.cglib.proxy")) {
            return className;
        }
        
        DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
        CustomDataSource customDataSource = null;
        if (null == dataTypeEnum) {
            try {
                customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl, version);
            }
            catch (Exception e) {
                throw new SourceException(e.getMessage());
            }
        }

        if (null == dataTypeEnum && null == customDataSource) {
            throw new SourceException("Not supported data type: jdbcUrl=" + jdbcUrl);
        }

        return className = null != dataTypeEnum && !StringUtils.isEmpty(dataTypeEnum.getDriver())
                ? dataTypeEnum.getDriver()
                : customDataSource.getDriver().trim();
    }


    /**
     * 释放失效数据源
     *
     * @param jdbcSourceInfo
     * @return
     */
    public void releaseDataSource(JdbcSourceInfo jdbcSourceInfo) {
		jdbcDataSource.removeDatasource(jdbcSourceInfo);
    }
    
    /**
     * get data source name for druid stat filter
     * 
     * @param name
     * @param projectId
     * @return
     */
	public static String getSourceName(String name, Long projectId) {
		return name + AT_SYMBOL + projectId;
	}

	/**
	 * get data source uuid
	 * 
	 * @param sourceName
	 * @param jdbcUrl
	 * @param username
	 * @param password
	 * @param version
	 * @param isExt
	 * @return
	 */
    public static String getSourceKey(String sourceName, String jdbcUrl, String username, String password, String version, boolean isExt) {

		StringBuilder sb = new StringBuilder();
		sb.append(sourceName).append(AT_SYMBOL);
		sb.append(jdbcUrl.trim()).append(AT_SYMBOL);
		sb.append(version).append(AT_SYMBOL);
		sb.append(username).append(AT_SYMBOL);
		sb.append(password).append(AT_SYMBOL);

		return MD5Utils.getMD5(sb.toString(), true, 64);
    }
    
    public static String getJdbcUrl(String config) {
    	if (StringUtils.isEmpty(config)) {
			return null;
		}
    	
    	String url = null;
		try {
			url = (String) JSONUtils.toObject(config, Map.class).get("url");
		} catch (Exception e) {
			log.error("Get jdbc url from source config({}) error, e={}", config, e.getMessage());
		}
		return url;
    }
    
    public static String getUsername(String config) {
    	if (StringUtils.isEmpty(config)) {
			return null;
		}

    	String username = null;
		try {
			username = (String) JSONUtils.toObject(config, Map.class).get("username");
		} catch (Exception e) {
			log.error("Get jdbc username from source config({}) error, e={}", config, e.getMessage());
		}
		return username;
    }
    
    public static String getPassword(String config) {
    	if (StringUtils.isEmpty(config)) {
			return null;
		}
    	
    	String password = null;
		try {
			password = (String) JSONUtils.toObject(config, Map.class).get("password");
		} catch (Exception e) {
			log.error("Get jdbc password from source config({}) error, e={}", config, e.getMessage());
		}
		return password;
    }
    
    public static String getDbVersion(String config) {
        String versoin = null;
        if (StringUtils.isEmpty(config)) {
            return null;
        }
        try {
            versoin = (String) JSONUtils.toObject(config, Map.class).get("versoin");
            if (JDBC_DATASOURCE_DEFAULT_VERSION.equals(versoin)) {
                return null;
            }
        } catch (Exception e) {
        	log.error("Get jdbc versoin from source config({}) error, e={}", config, e.getMessage());
        }
        return versoin;
    }
    
    public static boolean isExt(String config) {
        if (StringUtils.isEmpty(config)) {
            return false;
        }
        
        boolean ext = false;
        
        if (getDbVersion(config) == null) {
            ext = false;
        }
        
        try {
            ext = (boolean) JSONUtils.toObject(config, Map.class).get("ext");
        } catch (Exception e) {
        	log.error("Get jdbc ext from source config({}) error, e={}", config, e.getMessage());
        }
        return ext;
    }
    
    public static List<Dict> getProperties(String config) {
        if (StringUtils.isEmpty(config)) {
            return null;
        }

        List<Dict> dicts = null;
        try {
            Map<String, Object> configMap = JSONUtils.toObject(config, Map.class);
            if (configMap != null && configMap.containsKey("properties")) {
            	dicts = JSONUtils.toObjectArray(JSONUtils.toString(configMap.get("properties")), Dict.class);
            }
        } catch (Exception e) {
        	log.error("Get jdbc properties from source config({}) error, e={}", config, e.getMessage());
        }
        return dicts;
    }
    
}
