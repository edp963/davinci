/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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

package edp.davinci.data.util;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.MD5Utils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.data.enums.DatabaseTypeEnum;
import edp.davinci.data.exception.SourceException;
import edp.davinci.data.jdbc.ExtendedJdbcClassLoader;
import edp.davinci.data.pojo.CustomDatabase;
import edp.davinci.data.pojo.SourceConfig;
import edp.davinci.data.pojo.SourceProperty;
import edp.davinci.data.runner.LoadSupportDatabaseRunner;
import edp.davinci.data.source.JdbcDataSource;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.io.File;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;

import static edp.davinci.commons.Constants.*;
import static edp.davinci.data.commons.Constants.*;

@Slf4j
public class JdbcSourceUtils {

    private JdbcDataSource source;

    public JdbcSourceUtils(JdbcDataSource source) {
        this.source = source;
    }

    /**
     * 获取数据源
     *
     * @param config
     * @return
     * @throws SourceException
     */
	DataSource getDataSource(SourceConfig config) throws SourceException {
		return source.getDataSource(config);
	}

    public static boolean checkDriver(String databaseName, String url, String version, boolean isExt) {

    	if (StringUtils.isEmpty(databaseName) || !LoadSupportDatabaseRunner.getSupportDatabaseMap().containsKey(databaseName)) {
            throw new SourceException("Not supported database, url:" + url);
        }
        
		if (isExt && !StringUtils.isEmpty(version) && !DATABASE_DEFAULT_VERSION.equals(version)) {
			String path = System.getenv("DAVINCI_HOME") + File.separator
					+ String.format(EXT_LIB_PATH_FORMATTER, databaseName, version);
			ExtendedJdbcClassLoader extendedJdbcClassLoader = ExtendedJdbcClassLoader.getExtJdbcClassLoader(path);
			CustomDatabase database = CustomDatabaseUtils.getInstance(url, version);
			try {
				assert extendedJdbcClassLoader != null;
				Class<?> aClass = extendedJdbcClassLoader.loadClass(database.getDriver());
				if (null == aClass) {
					throw new SourceException("Unable to get driver instance for url:" + url);
				}
			} catch (Exception ex) {
				throw new SourceException("Unable to get driver instance for url:" + url);
			}
		} else {
			if (DatabaseTypeEnum.ELASTICSEARCH.getDesc().equals(databaseName) && !isExt) {
				return true;
			} else {
				try {
					String className = getDriverClassName(url, null);
					Class.forName(className);
				} catch (Exception e) {
					throw new SourceException("Unable to get driver instance for url:" + url, e);
				}
			}
		}
		return true;
    }
    
    public static String isSupportedDatabase(String url) {
        String database = getDatabase(url);
        if (StringUtils.isEmpty(database)) {
            throw new SourceException("Not supported database: url=" + url);
        }
        if (!LoadSupportDatabaseRunner.getSupportDatabaseMap().containsKey(database)) {
            throw new SourceException("Not supported database: url=" + url);
        }

        String urlPrefix = String.format(JDBC_URL_PREFIX_FORMATTER, database);
        String checkUrl = url.replaceFirst(DOUBLE_SLASH, EMPTY).replaceFirst(AT_SIGN, EMPTY);
        if (urlPrefix.equals(checkUrl)) {
            throw new SourceException("Communications link failure");
        }

        return database;
    }

    public static String getDatabase(String url) {
        String dataSourceName = null;
        url = url.replaceAll(NEW_LINE, EMPTY).replaceAll(SPACE, EMPTY).trim();
        Matcher matcher = JDBC_URL_PATTERN.matcher(url);
        if (matcher.find()) {
            dataSourceName = matcher.group().split(COLON)[1];
        }
        return dataSourceName;
    }

    public static String getDriverClassName(String url, String version) {
        
        String className = null;
        
        try {
            className = DriverManager.getDriver(url.trim()).getClass().getName();
        } catch (SQLException e) {

        }
        
        if (!StringUtils.isEmpty(className) && !className.contains("com.sun.proxy")
                && !className.contains("net.sf.cglib.proxy")) {
            return className;
        }
        
        DatabaseTypeEnum dataTypeEnum = DatabaseTypeEnum.urlOf(url);
        CustomDatabase customDatabase = null;
        if (null == dataTypeEnum) {
            try {
                customDatabase = CustomDatabaseUtils.getInstance(url, version);
            }
            catch (Exception e) {
                throw new SourceException(e.getMessage());
            }
        }

        if (null == dataTypeEnum && null == customDatabase) {
            throw new SourceException("Not supported data type: jdbcUrl=" + url);
        }

        return null != dataTypeEnum && !StringUtils.isEmpty(dataTypeEnum.getDriver())
                ? dataTypeEnum.getDriver()
                : customDatabase.getDriver().trim();
    }


    /**
     * 释放失效数据源
     *
     * @param config
     * @return
     */
    public void releaseDataSource(SourceConfig config) {
		source.releaseDatasource(config);
    }
    
    /**
     * get data source unique name
     * 
     * @param projectId
     * @param name
     * @return
     */
	public static String getSourceUName(Long projectId, String name) {
		return projectId + AT_SIGN + name;
	}

	/**
	 * get data source unique identification
	 * 
	 * @param name
	 * @param url
	 * @param username
	 * @param password
	 * @param version
	 * @param isExt
	 * @return
	 */
    public static String getSourceUID(String name, String url, String username, String password, String version, boolean isExt) {

		StringBuilder sb = new StringBuilder();
		sb.append(name).append(AT_SIGN);
		sb.append(url.trim()).append(AT_SIGN);
        sb.append(StringUtils.isEmpty(version) ? "null" : version).append(AT_SIGN);
		sb.append(StringUtils.isEmpty(username) ? "null" : username).append(AT_SIGN);
		sb.append(StringUtils.isEmpty(password) ? "null" : password).append(AT_SIGN);

		return MD5Utils.getMD5(sb.toString(), true, 64);
    }
    
    public static String getUrl(String config) {
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
    
    public static String getVersion(String config) {
    	if (StringUtils.isEmpty(config)) {
            return null;
        }
    	
    	String version = null;
        try {
            version = (String) JSONUtils.toObject(config, Map.class).get("version");
            if (DATABASE_DEFAULT_VERSION.equals(version)) {
                return null;
            }
        } catch (Exception e) {
        	log.error("Get jdbc version from source config({}) error, e={}", config, e.getMessage());
        }
        return version;
    }
    
    public static boolean isExt(String config) {
        if (StringUtils.isEmpty(config)) {
            return false;
        }
        
        boolean ext = false;
        
        if (getVersion(config) == null) {
            ext = false;
        }
        
        try {
            ext = (boolean) JSONUtils.toObject(config, Map.class).get("ext");
        } catch (Exception e) {
        	log.error("Get jdbc ext from source config({}) error, e={}", config, e.getMessage());
        }
        return ext;
    }
    
    @SuppressWarnings("unchecked")
	public static List<SourceProperty> getProperties(String config) {
        if (StringUtils.isEmpty(config)) {
            return null;
        }

        List<SourceProperty> properties = null;
        try {
            Map<String, Object> configMap = JSONUtils.toObject(config, Map.class);
            if (configMap != null && configMap.containsKey("properties")) {
            	properties = JSONUtils.toObjectArray(JSONUtils.toString(configMap.get("properties")), SourceProperty.class);
            }
        } catch (Exception e) {
        	log.error("Get jdbc properties from source config({}) error, e={}", config, e.getMessage());
        }
        return properties;
    }
    
    
	public static SourceConfig getSourceConfig(Source source) {

        String config = source.getConfig();
        if (StringUtils.isEmpty(config)) {
            return null;
        }

        SourceConfig sourceConfig = JSONUtils.toObject(config, SourceConfig.class);
        
        // get database from url
        sourceConfig.setDatabase(getDatabase(sourceConfig.getUrl()));
        
        if (StringUtils.isEmpty(sourceConfig.getName())) {
            sourceConfig.setName(getSourceUName(source.getProjectId(), source.getName()));
        }

        return sourceConfig;
    }
    
    public static void closeResult(ResultSet rs) {
        if (rs != null) {
            try {
                rs.close();
            } catch (Exception e) {
                log.error("ResultSet close error", e.getMessage());
            }
        }
    }
}
