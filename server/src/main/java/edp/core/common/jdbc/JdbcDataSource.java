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

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.util.StringUtils;
import edp.core.consts.Consts;
import edp.core.enums.DataTypeEnum;
import edp.core.exception.SourceException;
import edp.core.utils.MD5Util;
import edp.core.utils.ServerUtils;
import edp.core.utils.SourceUtils;
import edp.davinci.core.config.SpringContextHolder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

import static edp.core.consts.Consts.JDBC_DATASOURCE_DEFAULT_VERSION;

@Slf4j
@Component
public class JdbcDataSource extends DruidDataSource {

    @Value("${spring.datasource.type}")
    private String type;

    @Value("${source.max-active:10}")
    @Getter
    private int maxActive;

    @Value("${source.initial-size:1}")
    @Getter
    private int initialSize;

    @Value("${source.min-idle:3}")
    @Getter
    private int minIdle;

    @Value("${source.max-wait:30000}")
    @Getter
    private long maxWait;

    @Value("${spring.datasource.time-between-eviction-runs-millis}")
    @Getter
    private long timeBetweenEvictionRunsMillis;

    @Value("${spring.datasource.min-evictable-idle-time-millis}")
    @Getter
    private long minEvictableIdleTimeMillis;

    @Value("${spring.datasource.test-while-idle}")
    @Getter
    private boolean testWhileIdle;

    @Value("${spring.datasource.test-on-borrow}")
    @Getter
    private boolean testOnBorrow;

    @Value("${spring.datasource.test-on-return}")
    @Getter
    private boolean testOnReturn;

    @Value("${source.break-after-acquire-failure:true}")
    @Getter
    private boolean breakAfterAcquireFailure;

    @Value("${source.connection-error-retry-attempts:0}")
    @Getter
    private int connectionErrorRetryAttempts;

    @Value("${source.query-timeout:600000}")
    @Getter
    private int queryTimeout;

    private static volatile Map<String, DruidDataSource> map = new HashMap<>();

    public synchronized void removeDatasource(String jdbcUrl, String username, String password, String version, boolean isExt) {
        String key = getKey(jdbcUrl, username, password, version, isExt);

        if (map.containsKey(key)) {
            DruidDataSource druidDataSource = map.get(key);
            if (!druidDataSource.isEnable()) {
                druidDataSource.close();
                map.remove(key);
            }
        }
    }

    public synchronized DruidDataSource getDataSource(String jdbcUrl, String username, String password, String database, String version, boolean isExt) throws SourceException {
        String key = getKey(jdbcUrl, username, password, version, isExt);

        if (map.containsKey(key) && map.get(key) != null) {
            DruidDataSource druidDataSource = map.get(key);
            if (druidDataSource.isEnable()) {
                return druidDataSource;
            } else {
                druidDataSource.close();
                map.remove(key);
            }
        }

        DruidDataSource instance = new JdbcDataSource();

        if (StringUtils.isEmpty(version) || !isExt || JDBC_DATASOURCE_DEFAULT_VERSION.equals(version)) {
            String className = SourceUtils.getDriverClassName(jdbcUrl, null);
            try {
                Class<?> aClass = Class.forName(className);
                if (null == aClass) {
                    throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
                }
            } catch (ClassNotFoundException e) {
                throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
            }

            instance.setDriverClassName(className);

        } else {
            String path = ((ServerUtils) SpringContextHolder.getBean(ServerUtils.class)).getBasePath()
                    + String.format(Consts.PATH_EXT_FORMATER, database, version);
            instance.setDriverClassLoader(ExtendedJdbcClassLoader.getExtJdbcClassLoader(path));
        }

        instance.setUrl(jdbcUrl.trim());
        instance.setUsername(jdbcUrl.toLowerCase().contains(DataTypeEnum.ELASTICSEARCH.getFeature()) ? null : username);
        instance.setPassword((jdbcUrl.toLowerCase().contains(DataTypeEnum.PRESTO.getFeature()) || jdbcUrl.toLowerCase().contains(DataTypeEnum.ELASTICSEARCH.getFeature())) ?
                null : password);
        instance.setInitialSize(initialSize);
        instance.setMinIdle(minIdle);
        instance.setMaxActive(maxActive);
        instance.setMaxWait(maxWait);
        instance.setTimeBetweenEvictionRunsMillis(timeBetweenEvictionRunsMillis);
        instance.setMinEvictableIdleTimeMillis(minEvictableIdleTimeMillis);
        instance.setTestWhileIdle(false);
        instance.setTestOnBorrow(testOnBorrow);
        instance.setTestOnReturn(testOnReturn);
        instance.setConnectionErrorRetryAttempts(connectionErrorRetryAttempts);
        instance.setBreakAfterAcquireFailure(breakAfterAcquireFailure);
//        instance.setQueryTimeout(queryTimeout / 1000);

        try {
            instance.init();
        } catch (Exception e) {
            log.error("Exception during pool initialization", e);
            throw new SourceException(e.getMessage());
        }
        map.put(key, instance);
        return instance;
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
