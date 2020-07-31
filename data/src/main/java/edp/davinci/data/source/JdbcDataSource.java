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

package edp.davinci.data.source;

import java.io.File;
import java.util.Arrays;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import com.alibaba.druid.filter.Filter;
import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.wall.WallConfig;
import com.alibaba.druid.wall.WallFilter;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.data.commons.Constants;
import edp.davinci.data.enums.DatabaseTypeEnum;
import edp.davinci.data.exception.SourceException;
import edp.davinci.data.jdbc.ExtendedJdbcClassLoader;
import edp.davinci.data.pojo.SourceConfig;
import edp.davinci.data.util.CustomDatabaseUtils;
import edp.davinci.data.util.JdbcSourceUtils;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component()
public class JdbcDataSource {

    @Bean(name = "wallConfig")
	WallConfig wallConfig() {
		WallConfig config = new WallConfig();
        config.setDeleteAllow(false);
        config.setUpdateAllow(false);
        config.setInsertAllow(false);
        config.setReplaceAllow(false);
        config.setMergeAllow(false);
        config.setTruncateAllow(false);
        config.setCreateTableAllow(false);
        config.setAlterTableAllow(false);
        config.setDropTableAllow(false);
        // config.setCommentAllow(false);
        config.setUseAllow(false);
        config.setDescribeAllow(false);
        config.setShowAllow(false);
        config.setSelectWhereAlwayTrueCheck(false);
        config.setSelectHavingAlwayTrueCheck(false);
        config.setSelectUnionCheck(false);
        config.setConditionDoubleConstAllow(true);
        config.setConditionAndAlwayTrueAllow(true);
        config.setConditionAndAlwayFalseAllow(true);
		return config;
	}

    @Bean(name = "wallFilter")
	@DependsOn("wallConfig")
	WallFilter wallFilter(WallConfig wallConfig) {
		WallFilter wfilter = new WallFilter();
		wfilter.setConfig(wallConfig);
		return wfilter;
	}

    @Autowired
	WallFilter wallFilter;

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

    @Value("${source.time-between-eviction-runs-millis}")
    @Getter
    protected long timeBetweenEvictionRunsMillis;

    @Value("${source.min-evictable-idle-time-millis}")
    @Getter
    protected long minEvictableIdleTimeMillis;

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

    @Value("${source.connection-error-retry-attempts:0}")
    @Getter
    protected int connectionErrorRetryAttempts;

    @Value("${source.query-timeout:600000}")
    @Getter
    protected int queryTimeout;

    @Value("${source.validation-query}")
    @Getter
    protected String validationQuery;

    @Value("${aggregator.name}")
    @Getter
    protected String aggregatorName;
    
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
    
    public boolean isExist(SourceConfig config) {
        return dataSourceMap.containsKey(getDataSourceKey(config));
    }
    
    public void releaseDatasource(SourceConfig config) {
        
        String key = getDataSourceKey(config);

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

    public DruidDataSource getDataSource(SourceConfig config) throws SourceException {

    	boolean ext = config.isExt();
    	String name = config.getName();
        String url = config.getUrl();
        String username = config.getUsername();
        String password = config.getPassword();
        String version = config.getVersion();
        
        String key = getDataSourceKey(config);

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

        druidDataSource = dataSourceMap.get(key);
        if (druidDataSource != null && !druidDataSource.isClosed()) {
            return druidDataSource;
        }
        
        druidDataSource = new DruidDataSource();
        
        try {

            if (StringUtils.isEmpty(version) ||
                    !ext || Constants.DATABASE_DEFAULT_VERSION.equals(version)) {

                String className = JdbcSourceUtils.getDriverClassName(url, null);
                try {
                    Class.forName(className);
                } catch (ClassNotFoundException e) {
                    throw new SourceException("Unable to get driver instance for jdbcUrl: " + url);
                }

                druidDataSource.setDriverClassName(className);

            } else {
            	druidDataSource.setDriverClassName(CustomDatabaseUtils.getInstance(url, version).getDriver());
            	String path = System.getenv("DAVINCI_HOME") + File.separator  + String.format(Constants.EXT_LIB_PATH_FORMATER, config.getDatabase(), version);
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
            druidDataSource.setValidationQuery(validationQuery);

            if (!CollectionUtils.isEmpty(config.getProperties())) {
                Properties properties = new Properties();
                config.getProperties().forEach(p -> properties.setProperty(p.getKey(), p.getValue()));
                druidDataSource.setConnectProperties(properties);
            }

            try {
                druidDataSource.addFilters("stat");
                // davinci's aggregator source and statistic source don't need wall filter
                if (!name.equals(aggregatorName) && !name.equals("statistic")) {
                    druidDataSource.setProxyFilters(Arrays.asList(new Filter[] { wallFilter }));
                }
				druidDataSource.init();
            } catch (Exception e) {
                log.error("Exception during pool initialization", e);
                throw new SourceException(e.getMessage(), e);
            }

            dataSourceMap.put(key, druidDataSource);

        }finally {
            lock.unlock();
        }
        
        return druidDataSource;
    }
    
    private String getDataSourceKey (SourceConfig config) {
        return JdbcSourceUtils.getSourceUID(
        		config.getName(),
        		config.getUrl(),
        		config.getUsername(),
        		config.getPassword(),
        		config.getVersion(),
        		config.isExt());
    }
    
}
