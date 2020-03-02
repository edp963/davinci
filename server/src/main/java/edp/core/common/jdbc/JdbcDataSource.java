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

import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_CONNECTIONPROPERTIES;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_INITIALSIZE;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_MAXACTIVE;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_MAXWAIT;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_MINEVICTABLEIDLETIMEMILLIS;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_MINIDLE;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_PASSWORD;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_TESTONBORROW;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_TESTONRETURN;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_TESTWHILEIDLE;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_TIMEBETWEENEVICTIONRUNSMILLIS;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_URL;
import static com.alibaba.druid.pool.DruidDataSourceFactory.PROP_USERNAME;
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
	            if (!lock.tryLock(5L, TimeUnit.SECONDS)) {
	                throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
	            }
	        }
	        catch (InterruptedException e) {
	            throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
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
            properties.setProperty(PROP_TESTWHILEIDLE, String.valueOf(false));
            properties.setProperty(PROP_TESTONBORROW, String.valueOf(testOnBorrow));
            properties.setProperty(PROP_TESTONRETURN, String.valueOf(testOnReturn));
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

    @Value("${spring.datasource.type}")
    protected String type;

    @Value("${source.max-active:10}")
    @Getter
    protected int maxActive;

    @Value("${source.initial-size:1}")
    @Getter
    protected int initialSize;

    @Value("${source.min-idle:3}")
    @Getter
    protected int minIdle;

    @Value("${source.max-wait:30000}")
    @Getter
    protected long maxWait;

    @Value("${spring.datasource.time-between-eviction-runs-millis}")
    @Getter
    protected long timeBetweenEvictionRunsMillis;

    @Value("${spring.datasource.min-evictable-idle-time-millis}")
    @Getter
    protected long minEvictableIdleTimeMillis;

    @Value("${spring.datasource.test-while-idle}")
    @Getter
    protected boolean testWhileIdle;

    @Value("${spring.datasource.test-on-borrow}")
    @Getter
    protected boolean testOnBorrow;

    @Value("${spring.datasource.test-on-return}")
    @Getter
    protected boolean testOnReturn;

    @Value("${source.break-after-acquire-failure:true}")
    @Getter
    protected boolean breakAfterAcquireFailure;

    @Value("${source.connection-error-retry-attempts:0}")
    @Getter
    protected int connectionErrorRetryAttempts;

    @Value("${source.query-timeout:600000}")
    @Getter
    protected int queryTimeout;

    private static volatile Map<String, DruidDataSource> dataSourceMap = new ConcurrentHashMap<>();
    private static volatile Map<String, Lock> dataSourceLockMap = new ConcurrentHashMap<>();
    private static final Object lockLock = new Object();
    
    private Lock getDataSourceLock(String key) {
        if (dataSourceLockMap.containsKey(key)) {
            return dataSourceLockMap.get(key);
        }
        
        synchronized (lockLock) {
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
            if (!lock.tryLock(5L, TimeUnit.SECONDS)) {
                throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
            }
        }
        catch (InterruptedException e) {
            throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
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
            	String path = System.getenv("DAVINCI3_HOME") + File.separator  + String.format(Consts.PATH_EXT_FORMATER, jdbcSourceInfo.getDatabase(), dbVersion);
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
            druidDataSource.setTestWhileIdle(false);
            druidDataSource.setTestOnBorrow(testOnBorrow);
            druidDataSource.setTestOnReturn(testOnReturn);
            druidDataSource.setConnectionErrorRetryAttempts(connectionErrorRetryAttempts);
            druidDataSource.setBreakAfterAcquireFailure(breakAfterAcquireFailure);

            if (!CollectionUtils.isEmpty(jdbcSourceInfo.getProperties())) {
                Properties properties = new Properties();
                jdbcSourceInfo.getProperties().forEach(dict -> properties.setProperty(dict.getKey(), dict.getValue()));
                druidDataSource.setConnectProperties(properties);
            }

            try {
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
