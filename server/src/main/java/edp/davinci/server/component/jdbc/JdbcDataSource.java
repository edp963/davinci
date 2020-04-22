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

package edp.davinci.server.component.jdbc;

import java.io.File;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.alibaba.druid.pool.DruidDataSource;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.enums.DatabaseTypeEnum;
import edp.davinci.server.exception.SourceException;
import edp.davinci.server.model.JdbcSourceInfo;
import edp.davinci.server.util.CustomDatabaseUtils;
import edp.davinci.server.util.SourceUtils;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JdbcDataSource {
	
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
    
    @Value("${spring.datasource.filters}")
    private String filters;

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
    
    public boolean isExist(JdbcSourceInfo jdbcSourceInfo) {
        return dataSourceMap.containsKey(getDataSourceKey(jdbcSourceInfo));
    }
    
    public void releaseDatasource(JdbcSourceInfo jdbcSourceInfo) {
        
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
    	String name = jdbcSourceInfo.getName();
        String url = jdbcSourceInfo.getUrl();
        String username = jdbcSourceInfo.getUsername();
        String password = jdbcSourceInfo.getPassword();
        String version = jdbcSourceInfo.getVersion();
        
        String key = getDataSourceKey(jdbcSourceInfo);

        DruidDataSource druidDataSource = dataSourceMap.get(key);
        if (druidDataSource != null && !druidDataSource.isClosed()) {
                return druidDataSource;
        }
        
        Lock lock = getDataSourceLock(key);
        
        try {
            if (!lock.tryLock(5L, TimeUnit.SECONDS)) {
                throw new SourceException("Unable to get driver instance for jdbcUrl: " + url);
            }
        }
        catch (InterruptedException e) {
            throw new SourceException("Unable to get driver instance for jdbcUrl: " + url);
        }
        
        druidDataSource = new DruidDataSource();
        
        try {

            if (StringUtils.isEmpty(version) ||
                    !ext || Constants.JDBC_DATASOURCE_DEFAULT_VERSION.equals(version)) {

                String className = SourceUtils.getDriverClassName(url, null);
                try {
                    Class.forName(className);
                } catch (ClassNotFoundException e) {
                    throw new SourceException("Unable to get driver instance for jdbcUrl: " + url);
                }

                druidDataSource.setDriverClassName(className);

            } else {
            	druidDataSource.setDriverClassName(CustomDatabaseUtils.getInstance(url, version).getDriver());
            	String path = System.getenv("DAVINCI_HOME") + File.separator  + String.format(Constants.PATH_EXT_FORMATER, jdbcSourceInfo.getDatabase(), version);
            	druidDataSource.setDriverClassLoader(ExtendedJdbcClassLoader.getExtJdbcClassLoader(path));
            }

            druidDataSource.setName(name);
            druidDataSource.setUrl(url);
            druidDataSource.setUsername(username);

            if (!url.toLowerCase().contains(DatabaseTypeEnum.PRESTO.getFeature())) {
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
				druidDataSource.setFilters("stat");
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
        return SourceUtils.getSourceUID(
        		jdbcSourceInfo.getName(),
        		jdbcSourceInfo.getUrl(),
                jdbcSourceInfo.getUsername(),
                jdbcSourceInfo.getPassword(),
                jdbcSourceInfo.getVersion(),
                jdbcSourceInfo.isExt());
    }
    
}
