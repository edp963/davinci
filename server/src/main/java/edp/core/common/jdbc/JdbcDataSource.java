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

package edp.core.common.jdbc;

import static com.alibaba.druid.pool.DruidDataSourceFactory.*;
import static edp.core.consts.Consts.JDBC_DATASOURCE_DEFAULT_VERSION;

import java.io.File;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.pool.ElasticSearchDruidDataSourceFactory;
import com.alibaba.druid.util.StringUtils;

import edp.core.consts.Consts;
import edp.core.enums.DataTypeEnum;
import edp.core.exception.SourceException;
import edp.core.model.JdbcSourceInfo;
import edp.core.utils.CollectionUtils;
import edp.core.utils.CustomDataSourceUtils;
import edp.core.utils.SourceUtils;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JdbcDataSource {
	
	@Component
	private class ESDataSource extends JdbcDataSource {
		
		public DruidDataSource getDataSource(JdbcSourceInfo jdbcSourceInfo) throws SourceException {
	        
			String jdbcUrl = jdbcSourceInfo.getJdbcUrl();
	        String username = jdbcSourceInfo.getUsername();
	        String password = jdbcSourceInfo.getPassword();
	        
	        String key = getDataSourceKey(jdbcSourceInfo);

			DruidDataSource druidDataSource = dataSourceMap.get(key);
			if (druidDataSource != null && !druidDataSource.isClosed()) {
				return druidDataSource;
			}

	        Lock lock = getDataSourceLock(key);

            try {
                if (!lock.tryLock(60L, TimeUnit.SECONDS)) {
                    druidDataSource = dataSourceMap.get(key);
                    if (druidDataSource != null && !druidDataSource.isClosed()) {
                        return druidDataSource;
                    }
                    throw new SourceException("Unable to get datasource for jdbcUrl: " + jdbcUrl);
                }
            }
            catch (InterruptedException e) {
                throw new SourceException("Unable to get datasource for jdbcUrl: " + jdbcUrl);
            }

            druidDataSource = dataSourceMap.get(key);
            if (druidDataSource != null && !druidDataSource.isClosed()) {
                lock.unlock();
                return druidDataSource;
            }
	        
	        druidDataSource = dataSourceMap.get(key);
			if (druidDataSource != null && !druidDataSource.isClosed()) {
				return druidDataSource;
			}
	        
            Properties properties = new Properties();
            properties.setProperty(PROP_URL, jdbcUrl.trim());
            if (!StringUtils.isEmpty(username)) {
                properties.setProperty(PROP_USERNAME, username);
            }
            
            if (!StringUtils.isEmpty(password)) {
                properties.setProperty(PROP_PASSWORD, password);
            }
            
            properties.setProperty(PROP_MAXACTIVE, String.valueOf(maxActive));
            properties.setProperty(PROP_INITIALSIZE, String.valueOf(initialSize));
            properties.setProperty(PROP_MINIDLE, String.valueOf(minIdle));
            properties.setProperty(PROP_MAXWAIT, String.valueOf(maxWait));
            properties.setProperty(PROP_TIMEBETWEENEVICTIONRUNSMILLIS, String.valueOf(timeBetweenEvictionRunsMillis));
            properties.setProperty(PROP_MINEVICTABLEIDLETIMEMILLIS, String.valueOf(minEvictableIdleTimeMillis));
            properties.setProperty(PROP_MAXOPENPREPAREDSTATEMENTS, String.valueOf(maxEvictableIdleTimeMillis));
            properties.setProperty(PROP_TESTWHILEIDLE, String.valueOf(testWhileIdle));
            properties.setProperty(PROP_TESTONBORROW, String.valueOf(testOnBorrow));
            properties.setProperty(PROP_TESTONRETURN, String.valueOf(testOnReturn));
            properties.setProperty(PROP_VALIDATIONQUERY, validationQuery);
            properties.setProperty(PROP_VALIDATIONQUERY_TIMEOUT, String.valueOf(validationQueryTimeout));
            properties.setProperty(PROP_REMOVEABANDONED, "true");
            properties.setProperty(PROP_REMOVEABANDONEDTIMEOUT, "3900");
            properties.setProperty(PROP_LOGABANDONED, "true");
            properties.put(PROP_CONNECTIONPROPERTIES, "client.transport.ignore_cluster_name=true");

            if (!CollectionUtils.isEmpty(jdbcSourceInfo.getProperties())) {
                jdbcSourceInfo.getProperties().forEach(dict -> properties.setProperty(dict.getKey(), dict.getValue()));
            }

            try {
            	druidDataSource = (DruidDataSource)ElasticSearchDruidDataSourceFactory.createDataSource(properties);
            	dataSourceMap.put(key, druidDataSource);
            } catch (Exception e) {
                log.error("Exception during pool initialization", e);
                throw new SourceException(e.getMessage());
            }finally {
                lock.unlock();
            }

            return druidDataSource;
	    }
	}
	
	@Autowired
	private ESDataSource esDataSource;

    @Value("${source.max-active:8}")
    @Getter
    protected int maxActive;

    @Value("${source.initial-size:0}")
    @Getter
    protected int initialSize;

    @Value("${source.min-idle:1}")
    @Getter
    protected int minIdle;

    @Value("${source.max-wait:60000}")
    @Getter
    protected long maxWait;

    @Value("${source.time-between-eviction-runs-millis}")
    @Getter
    protected long timeBetweenEvictionRunsMillis;

    @Value("${source.min-evictable-idle-time-millis}")
    @Getter
    protected long minEvictableIdleTimeMillis;

    @Value("${source.max-evictable-idle-time-millis}")
    @Getter
    protected long maxEvictableIdleTimeMillis;

    @Value("${source.test-while-idle}")
    @Getter
    protected boolean testWhileIdle;

    @Value("${source.test-on-borrow}")
    @Getter
    protected boolean testOnBorrow;

    @Value("${source.test-on-return}")
    @Getter
    protected boolean testOnReturn;

    @Value("${source.break-after-acquire-failure:true}")
    @Getter
    protected boolean breakAfterAcquireFailure;

    @Value("${source.connection-error-retry-attempts:1}")
    @Getter
    protected int connectionErrorRetryAttempts;

    @Value("${source.keep-alive:false}")
    @Getter
    protected boolean keepAlive;

    @Value("${source.validation-query-timeout:5}")
    @Getter
    protected int validationQueryTimeout;

    @Value("${source.validation-query}")
    @Getter
    protected String validationQuery;

    @Value("${source.filters}")
    @Getter
    protected String filters;

    private static volatile Map<String, DruidDataSource> dataSourceMap = new ConcurrentHashMap<>();
    private static volatile Map<String, Lock> dataSourceLockMap = new ConcurrentHashMap<>();
    private static final Object lockLock = new Object();
    
    private Lock getDataSourceLock(String key) {
		if (dataSourceLockMap.containsKey(key)) {
			return dataSourceLockMap.get(key);
		}

		synchronized (lockLock) {
			if (dataSourceLockMap.containsKey(key)) {
				return dataSourceLockMap.get(key);
			}
			Lock lock = new ReentrantLock();
			dataSourceLockMap.put(key, lock);
			return lock;
		}
    }
    
    /**
     * only for test
     * @param jdbcSourceInfo
     * @return
     */
    public boolean isDataSourceExist(JdbcSourceInfo jdbcSourceInfo) {
        
        return dataSourceMap.containsKey(getDataSourceKey(jdbcSourceInfo));
    }
    
    public void removeDatasource(JdbcSourceInfo jdbcSourceInfo) {
        
        String key = getDataSourceKey(jdbcSourceInfo);

        Lock lock = getDataSourceLock(key);

        if (!lock.tryLock()) {
            return;
        }
    
        try {
            DruidDataSource druidDataSource = dataSourceMap.remove(key);
            if (druidDataSource != null) {
                druidDataSource.close();
            }
            
            dataSourceLockMap.remove(key);
        }finally {
            lock.unlock();
        }
    }

    public DruidDataSource getDataSource(JdbcSourceInfo jdbcSourceInfo) throws SourceException {

    	boolean ext = jdbcSourceInfo.isExt();
    	if (jdbcSourceInfo.getJdbcUrl().toLowerCase().contains(DataTypeEnum.ELASTICSEARCH.getDesc().toLowerCase()) && !ext) {
            return esDataSource.getDataSource(jdbcSourceInfo);
        }
        
        String jdbcUrl = jdbcSourceInfo.getJdbcUrl();
        String username = jdbcSourceInfo.getUsername();
        String password = jdbcSourceInfo.getPassword();
        String dbVersion = jdbcSourceInfo.getDbVersion();
        
        String key = getDataSourceKey(jdbcSourceInfo);

		DruidDataSource druidDataSource = dataSourceMap.get(key);
		if (druidDataSource != null && !druidDataSource.isClosed()) {
			return druidDataSource;
		}
        
        Lock lock = getDataSourceLock(key);
        
        try {
            if (!lock.tryLock(30L, TimeUnit.SECONDS)) {
                druidDataSource = dataSourceMap.get(key);
                if (druidDataSource != null && !druidDataSource.isClosed()) {
                    return druidDataSource;
                }
                throw new SourceException("Unable to get datasource for jdbcUrl: " + jdbcUrl);
            }
        }
        catch (InterruptedException e) {
            throw new SourceException("Unable to get datasource for jdbcUrl: " + jdbcUrl);
        }
        
		druidDataSource = dataSourceMap.get(key);
		if (druidDataSource != null && !druidDataSource.isClosed()) {
            lock.unlock();
			return druidDataSource;
		}
        
        druidDataSource = new DruidDataSource();
        
        try {

            if (StringUtils.isEmpty(dbVersion) ||
                    !ext || JDBC_DATASOURCE_DEFAULT_VERSION.equals(dbVersion)) {

                String className = SourceUtils.getDriverClassName(jdbcUrl, null);
                try {
                    Class.forName(className);
                } catch (ClassNotFoundException e) {
                    throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
                }

                druidDataSource.setDriverClassName(className);

            } else {
            	druidDataSource.setDriverClassName(CustomDataSourceUtils.getInstance(jdbcUrl, dbVersion).getDriver());
            	String path = System.getenv("DAVINCI3_HOME") + File.separator  + String.format(Consts.PATH_EXT_FORMATTER, jdbcSourceInfo.getDatabase(), dbVersion);
            	druidDataSource.setDriverClassLoader(ExtendedJdbcClassLoader.getExtJdbcClassLoader(path));
            }

            druidDataSource.setUrl(jdbcUrl);
            druidDataSource.setUsername(username);

            if (!jdbcUrl.toLowerCase().contains(DataTypeEnum.PRESTO.getFeature())) {
                druidDataSource.setPassword(password);
            }

            druidDataSource.setInitialSize(initialSize);
            druidDataSource.setMinIdle(minIdle);
            druidDataSource.setMaxActive(maxActive);
            druidDataSource.setMaxWait(maxWait);
            druidDataSource.setTimeBetweenEvictionRunsMillis(timeBetweenEvictionRunsMillis);
            druidDataSource.setMinEvictableIdleTimeMillis(minEvictableIdleTimeMillis);
            druidDataSource.setMaxEvictableIdleTimeMillis(maxEvictableIdleTimeMillis);
            druidDataSource.setTestWhileIdle(testWhileIdle);
            druidDataSource.setTestOnBorrow(testOnBorrow);
            druidDataSource.setTestOnReturn(testOnReturn);
            druidDataSource.setConnectionErrorRetryAttempts(connectionErrorRetryAttempts);
            druidDataSource.setBreakAfterAcquireFailure(breakAfterAcquireFailure);
            druidDataSource.setKeepAlive(keepAlive);
            druidDataSource.setValidationQueryTimeout(validationQueryTimeout);
            druidDataSource.setValidationQuery(validationQuery);
            druidDataSource.setRemoveAbandoned(true);
            druidDataSource.setRemoveAbandonedTimeout(3600 + 5 * 60);
            druidDataSource.setLogAbandoned(true);

            // default validation query
            String driverName = druidDataSource.getDriverClassName();
            if (driverName.indexOf("sqlserver") != -1 || driverName.indexOf("mysql") != -1
                    || driverName.indexOf("h2") != -1 || driverName.indexOf("moonbox") != -1) {
                druidDataSource.setValidationQuery("select 1");
            }

            if (driverName.indexOf("oracle") != -1) {
                druidDataSource.setValidationQuery("select 1 from dual");
            }

            if (!CollectionUtils.isEmpty(jdbcSourceInfo.getProperties())) {
                Properties properties = new Properties();
                jdbcSourceInfo.getProperties().forEach(dict -> properties.setProperty(dict.getKey(), dict.getValue()));
                druidDataSource.setConnectProperties(properties);
            }

            try {
                druidDataSource.setFilters(filters);
                druidDataSource.init();
            } catch (Exception e) {
                log.error("Exception during pool initialization", e);
                throw new SourceException(e.getMessage());
            }

            dataSourceMap.put(key, druidDataSource);

        }finally {
            lock.unlock();
        }
        
        return druidDataSource;
    }
    
    private String getDataSourceKey (JdbcSourceInfo jdbcSourceInfo) {
        return SourceUtils.getKey(jdbcSourceInfo.getJdbcUrl(),
                jdbcSourceInfo.getUsername(),
                jdbcSourceInfo.getPassword(),
                jdbcSourceInfo.getDbVersion(),
                jdbcSourceInfo.isExt());
    }
    
}
