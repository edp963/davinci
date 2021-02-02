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
import edp.davinci.data.pojo.SourceProperty;
import edp.davinci.data.provider.CSVDataProvider;
import edp.davinci.data.util.CustomDatabaseUtils;
import edp.davinci.data.util.JdbcSourceUtils;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

@Slf4j
@Component
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
        config.setCommentAllow(true);
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

    @Value("${source.time-between-connect-error-millis}")
    @Getter
    protected long timeBetweenConnectErrorMillis;

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

    @Value("${aggregator.name}")
    @Getter
    protected String aggregatorName;

    @Value("${source.filters}")
    @Getter
    protected String filters;

    private static volatile Map<String, DruidDataSource> dataSourceMap = new ConcurrentHashMap<>();
    private static volatile Map<String, Lock> dataSourceLockMap = new ConcurrentHashMap<>();

    @Getter
    private static Set<String> releaseSet = new HashSet();

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
     * @param config
     * @return
     */
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
        String type = config.getType();

        String key = getDataSourceKey(config);

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
                throw new SourceException("Unable to get datasource for jdbcUrl: " + url);
            }
        }
        catch (InterruptedException e) {
            throw new SourceException("Unable to get datasource for jdbcUrl: " + url);
        }

		druidDataSource = dataSourceMap.get(key);
		if (druidDataSource != null && !druidDataSource.isClosed()) {
            lock.unlock();
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
            	String path = System.getenv("DAVINCI_HOME") + File.separator  + String.format(Constants.EXT_LIB_PATH_FORMATTER, config.getDatabase(), version);
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
            druidDataSource.setMaxEvictableIdleTimeMillis(maxEvictableIdleTimeMillis);
            druidDataSource.setTimeBetweenConnectErrorMillis(timeBetweenConnectErrorMillis);
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

            if (driverName.indexOf("elasticsearch") != -1) {
                druidDataSource.setValidationQuery(null);
            }

            // druid wall filter not support some database so set type mysql
            if (DatabaseTypeEnum.MOONBOX == DatabaseTypeEnum.urlOf(url) ||
                    DatabaseTypeEnum.MONGODB == DatabaseTypeEnum.urlOf(url) ||
                    DatabaseTypeEnum.ELASTICSEARCH == DatabaseTypeEnum.urlOf(url) ||
                    DatabaseTypeEnum.CASSANDRA == DatabaseTypeEnum.urlOf(url) ||
                    DatabaseTypeEnum.VERTICA == DatabaseTypeEnum.urlOf(url) ||
                    DatabaseTypeEnum.KYLIN == DatabaseTypeEnum.urlOf(url) ||
                    DatabaseTypeEnum.HANA == DatabaseTypeEnum.urlOf(url) ||
                    DatabaseTypeEnum.IMPALA == DatabaseTypeEnum.urlOf(url) ||
                    DatabaseTypeEnum.TDENGINE == DatabaseTypeEnum.urlOf(url)) {
                wallFilter.setDbType(DatabaseTypeEnum.MYSQL.getFeature());
            }

            Properties properties = new Properties();
            if (driverName.indexOf("mysql") != -1) {
                properties.setProperty("druid.mysql.usePingMethod", "false");
            }

            if (!CollectionUtils.isEmpty(config.getProperties())) {
                for (SourceProperty property : config.getProperties()) {

                    if ("davinci.db-type".equalsIgnoreCase(property.getKey())) {
                        wallFilter.setDbType(property.getValue());
                        continue;
                    }

                    if ("davinci.initial-size".equalsIgnoreCase(property.getKey())) {
                        druidDataSource.setInitialSize(Integer.parseInt(property.getValue()));
                        continue;
                    }

                    if ("davinci.min-idle".equalsIgnoreCase(property.getKey())) {
                        druidDataSource.setMinIdle(Integer.parseInt(property.getValue()));
                        continue;
                    }

                    if ("davinci.max-active".equalsIgnoreCase(property.getKey())) {
                        druidDataSource.setMaxActive(Integer.parseInt(property.getValue()));
                        continue;
                    }

                    properties.setProperty(property.getKey(), property.getValue());
                }
            }

            druidDataSource.setConnectProperties(properties);

            try {
                druidDataSource.setFilters(filters);

                // you can operate csv datasource
                if (CSVDataProvider.type.equals(type)) {
                    WallConfig wallConfig = wallFilter.getConfig();
                    wallConfig.setDropTableAllow(true);
                    wallConfig.setCreateTableAllow(true);
                    wallConfig.setInsertAllow(true);
                    wallConfig.setTruncateAllow(true);
                    druidDataSource.setProxyFilters(Arrays.asList(new Filter[]{wallFilter}));
                } else if (!name.equals(aggregatorName) && !name.equals("statistic")) {// davinci's aggregator source and statistic source don't need wall filter
                    druidDataSource.setProxyFilters(Arrays.asList(new Filter[]{wallFilter}));
                }

				druidDataSource.init();
            } catch (Exception e) {
                log.error("Exception during pool initialization", e);
                throw new SourceException(e.toString(), e);
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
