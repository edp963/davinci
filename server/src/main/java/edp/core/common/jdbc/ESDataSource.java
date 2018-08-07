/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.core.common.jdbc;

import com.alibaba.druid.pool.ElasticSearchDruidDataSourceFactory;
import edp.core.exception.SourceException;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Slf4j
public class ESDataSource {

    private ESDataSource() {
    }

    private static volatile DataSource dataSource = null;

    private static volatile Map<String, DataSource> map = new HashMap<>();

    public static synchronized DataSource getDataSource(String jdbcUrl, String username) throws SourceException {
        String url = jdbcUrl.toLowerCase();
        if (!map.containsKey(username + "@" + url) || null == map.get(username + "@" + url)) {
            Properties properties = new Properties();
            properties.setProperty("url", url);
            try {
                dataSource = ElasticSearchDruidDataSourceFactory.createDataSource(properties);
                map.put(username + "@" + url, dataSource);
            } catch (Exception e) {
                log.error("Exception during pool initialization, ", e);
                throw new SourceException("Exception during pool initialization: jdbcUrl=" + jdbcUrl);
            }
        }
        return map.get(username + "@" + url);
    }
}
