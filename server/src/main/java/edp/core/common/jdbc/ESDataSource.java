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

import com.alibaba.druid.pool.ElasticSearchDruidDataSourceFactory;
import com.alibaba.druid.util.StringUtils;
import edp.core.exception.SourceException;
import edp.core.model.JdbcSourceInfo;
import edp.core.utils.CollectionUtils;
import edp.core.utils.SourceUtils;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import static com.alibaba.druid.pool.DruidDataSourceFactory.*;

@Slf4j
public class ESDataSource {

    private ESDataSource() {
    }

    private static volatile DataSource dataSource = null;

    private static volatile Map<String, DataSource> esDataSourceMap = new HashMap<>();

    public static synchronized DataSource getDataSource(JdbcSourceInfo jdbcSourceInfo, JdbcDataSource jdbcDataSource) throws SourceException {
        String jdbcUrl = jdbcSourceInfo.getJdbcUrl();
        String username = jdbcSourceInfo.getUsername();
        String password = jdbcSourceInfo.getPassword();
        
        String key = SourceUtils.getKey(jdbcUrl, username, password, null, false);
        if (!esDataSourceMap.containsKey(key) || null == esDataSourceMap.get(key)) {
            Properties properties = new Properties();
            properties.setProperty(PROP_URL, jdbcUrl.trim());
            if (!StringUtils.isEmpty(username)) {
                properties.setProperty(PROP_USERNAME, username);
            }
            if (!StringUtils.isEmpty(password)) {
                properties.setProperty(PROP_PASSWORD, password);
            }
            properties.setProperty(PROP_MAXACTIVE, String.valueOf(jdbcDataSource.getMaxActive()));
            properties.setProperty(PROP_INITIALSIZE, String.valueOf(jdbcDataSource.getInitialSize()));
            properties.setProperty(PROP_MINIDLE, String.valueOf(jdbcDataSource.getMinIdle()));
            properties.setProperty(PROP_MAXWAIT, String.valueOf(jdbcDataSource.getMaxActive()));
            properties.setProperty(PROP_MAXWAIT, String.valueOf(jdbcDataSource.getMaxWait()));
            properties.setProperty(PROP_TIMEBETWEENEVICTIONRUNSMILLIS, String.valueOf(jdbcDataSource.getTimeBetweenEvictionRunsMillis()));
            properties.setProperty(PROP_MINEVICTABLEIDLETIMEMILLIS, String.valueOf(jdbcDataSource.getMinEvictableIdleTimeMillis()));
            properties.setProperty(PROP_TESTWHILEIDLE, String.valueOf(false));
            properties.setProperty(PROP_TESTONBORROW, String.valueOf(jdbcDataSource.isTestOnBorrow()));
            properties.setProperty(PROP_TESTONRETURN, String.valueOf(jdbcDataSource.isTestOnReturn()));
            properties.put(PROP_CONNECTIONPROPERTIES, "client.transport.ignore_cluster_name=true");

            if (!CollectionUtils.isEmpty(jdbcSourceInfo.getProperties())) {
                jdbcSourceInfo.getProperties().forEach(dict -> properties.setProperty(dict.getKey(), dict.getValue()));
            }

            try {
                dataSource = ElasticSearchDruidDataSourceFactory.createDataSource(properties);
                esDataSourceMap.put(key, dataSource);
            } catch (Exception e) {
                log.error("Exception during pool initialization, ", e);
                throw new SourceException(e.getMessage());
            }
        }
        return esDataSourceMap.get(key);
    }

    public static void removeDataSource(String jdbcUrl, String userename, String password) {
        String key = SourceUtils.getKey(jdbcUrl, userename, password, null, false);
        if (esDataSourceMap.containsKey(key)) {
            esDataSourceMap.remove(key);
        }
    }
}
