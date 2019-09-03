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

package edp.core.utils;

import com.alibaba.druid.util.StringUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import edp.core.consts.Consts;
import edp.core.model.CustomDataSource;
import lombok.Getter;
import org.yaml.snakeyaml.Yaml;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.*;

import static edp.core.consts.Consts.JDBC_DATASOURCE_DEFAULT_VERSION;


public class CustomDataSourceUtils {

    private static volatile Map<String, CustomDataSource> customDataSourceMap = new HashMap<>();

    @Getter
    private static volatile Map<String, List<String>> dataSourceVersoin = new HashMap<String, List<String>>();

    public static CustomDataSource getInstance(String jdbcUrl, String version) {
        String dataSourceName = SourceUtils.getDataSourceName(jdbcUrl);
        String key = getKey(dataSourceName, version);
        if (customDataSourceMap.containsKey(key) && null != customDataSourceMap.get(key)) {
            CustomDataSource customDataSource = customDataSourceMap.get(key);
            if (null != customDataSource) {
                return customDataSource;
            }
        }
        return null;
    }


    public static void loadAllFromYaml(String yamlPath) throws Exception {
        if (StringUtils.isEmpty(yamlPath)) {
            return;
        }
        File yamlFile = new File(yamlPath);
        if (!yamlFile.exists()) {
            return;
        }
        if (!yamlFile.isFile()) {
            return;
        }
        if (!yamlFile.canRead()) {
            return;
        }

        Yaml yaml = new Yaml();
        HashMap<String, Object> loads = yaml.loadAs(new BufferedReader(new FileReader(yamlFile)), HashMap.class);
        if (!CollectionUtils.isEmpty(loads)) {
            ObjectMapper mapper = new ObjectMapper();
            for (String key : loads.keySet()) {
                CustomDataSource customDataSource = mapper.convertValue(loads.get(key), CustomDataSource.class);
                if (StringUtils.isEmpty(customDataSource.getName()) || StringUtils.isEmpty(customDataSource.getDriver())) {
                    throw new Exception("Load custom datasource error: name or driver cannot be EMPTY");
                }
                if ("null".equals(customDataSource.getName().trim().toLowerCase())) {
                    throw new Exception("Load custom datasource error: invalid name");
                }
                if ("null".equals(customDataSource.getDriver().trim().toLowerCase())) {
                    throw new Exception("Load custom datasource error: invalid driver");
                }

                if (StringUtils.isEmpty(customDataSource.getDesc())) {
                    customDataSource.setDesc(customDataSource.getName());
                }
                if ("null".equals(customDataSource.getDesc().trim().toLowerCase())) {
                    customDataSource.setDesc(customDataSource.getName());
                }

                if (!StringUtils.isEmpty(customDataSource.getKeyword_prefix()) || !StringUtils.isEmpty(customDataSource.getKeyword_suffix())) {
                    if (StringUtils.isEmpty(customDataSource.getKeyword_prefix()) || StringUtils.isEmpty(customDataSource.getKeyword_suffix())) {
                        throw new Exception("Load custom datasource error: keyword prefixes and suffixes must be configured in pairs.");
                    }
                }

                if (!StringUtils.isEmpty(customDataSource.getAlias_prefix()) || !StringUtils.isEmpty(customDataSource.getAlias_suffix())) {
                    if (StringUtils.isEmpty(customDataSource.getAlias_prefix()) || StringUtils.isEmpty(customDataSource.getAlias_suffix())) {
                        throw new Exception("Load custom datasource error: alias prefixes and suffixes must be configured in pairs.");
                    }
                }

                List<String> versoins = null;
                if (dataSourceVersoin.containsKey(customDataSource.getName())) {
                    versoins = dataSourceVersoin.get(customDataSource.getName());
                } else {
                    versoins = new ArrayList<>();
                }
                if (StringUtils.isEmpty(customDataSource.getVersion())) {
                    versoins.add(0, JDBC_DATASOURCE_DEFAULT_VERSION);
                } else {
                    versoins.add(customDataSource.getVersion());
                }
                dataSourceVersoin.put(customDataSource.getName(), versoins);
                customDataSourceMap.put(getKey(customDataSource.getName(), customDataSource.getVersion()), customDataSource);
            }
        }
    }

    private static String getKey(String database, String version) {
        return database + Consts.COLON + (StringUtils.isEmpty(version) ? Consts.EMPTY : version);
    }
}
