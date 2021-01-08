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

import com.alibaba.druid.filter.Filter;
import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.util.StringUtils;
import com.alibaba.druid.wall.WallConfig;
import com.alibaba.druid.wall.WallFilter;
import edp.core.consts.Consts;
import edp.core.enums.DataTypeEnum;
import edp.core.exception.SourceException;
import edp.core.model.Dict;
import edp.core.model.JdbcSourceInfo;
import edp.core.utils.CollectionUtils;
import edp.core.utils.CustomDataSourceUtils;
import edp.core.utils.SourceUtils;
import edp.davinci.core.enums.SourceTypeEnum;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.Arrays;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import static edp.core.consts.Consts.JDBC_DATASOURCE_DEFAULT_VERSION;

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

        String name = jdbcSourceInfo.getName();
        String type = jdbcSourceInfo.getType();
        String jdbcUrl = jdbcSourceInfo.getJdbcUrl();
        String username = jdbcSourceInfo.getUsername();
        String password = jdbcSourceInfo.getPassword();
        String dbVersion = jdbcSourceInfo.getDbVersion();
        boolean ext = jdbcSourceInfo.isExt();

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

            druidDataSource.setName(name);
            druidDataSource.setUrl(jdbcUrl);
            druidDataSource.setUsername(username);

            if (!jdbcUrl.toLowerCase().contains(DataTypeEnum.PRESTO.getFeature())) {
                druidDataSource.setPassword(password);
            }

            druidDataSource.setInitialSize(initialSize);
            druidDataSource.setMinIdle(minIdle);
            druidDataSource.setMaxIdle(minIdle);
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
            if (DataTypeEnum.MOONBOX == DataTypeEnum.urlOf(jdbcUrl) ||
                    DataTypeEnum.MONGODB == DataTypeEnum.urlOf(jdbcUrl) ||
                    DataTypeEnum.ELASTICSEARCH == DataTypeEnum.urlOf(jdbcUrl) ||
                    DataTypeEnum.CASSANDRA == DataTypeEnum.urlOf(jdbcUrl) ||
                    DataTypeEnum.VERTICA == DataTypeEnum.urlOf(jdbcUrl) ||
                    DataTypeEnum.HANA == DataTypeEnum.urlOf(jdbcUrl) ||
                    DataTypeEnum.IMPALA == DataTypeEnum.urlOf(jdbcUrl) ||
                    DataTypeEnum.TDENGINE == DataTypeEnum.urlOf(jdbcUrl)) {
                wallFilter.setDbType(DataTypeEnum.MYSQL.getFeature());
            }

            Properties properties = new Properties();
            if (driverName.indexOf("mysql") != -1) {
                properties.setProperty("druid.mysql.usePingMethod", "false");
            }

            if (!CollectionUtils.isEmpty(jdbcSourceInfo.getProperties())) {
                for (Dict dict : jdbcSourceInfo.getProperties()) {

                    if ("davinci.db-type".equalsIgnoreCase(dict.getKey())) {
                        wallFilter.setDbType(dict.getValue());
                        continue;
                    }

                    if ("davinci.initial-size".equalsIgnoreCase(dict.getKey())) {
                        druidDataSource.setInitialSize(Integer.parseInt(dict.getValue()));
                        continue;
                    }

                    if ("davinci.min-idle".equalsIgnoreCase(dict.getKey())) {
                        druidDataSource.setMinIdle(Integer.parseInt(dict.getValue()));
                        continue;
                    }

                    if ("davinci.max-active".equalsIgnoreCase(dict.getKey())) {
                        druidDataSource.setMaxActive(Integer.parseInt(dict.getValue()));
                        continue;
                    }

                    properties.setProperty(dict.getKey(), dict.getValue());
                }
            }

            druidDataSource.setConnectProperties(properties);

            try {

                // davinci's statistic source & csv source don't need wall filter
                if (!"statistic".equals(name) && SourceTypeEnum.JDBC.getType().equalsIgnoreCase(type)) {
                    druidDataSource.setProxyFilters(Arrays.asList(new Filter[]{wallFilter}));
                }

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
        return SourceUtils.getKey(jdbcSourceInfo.getName(),
                jdbcSourceInfo.getJdbcUrl(),
                jdbcSourceInfo.getUsername(),
                jdbcSourceInfo.getPassword(),
                jdbcSourceInfo.getDbVersion(),
                jdbcSourceInfo.isExt());
    }
    
}
