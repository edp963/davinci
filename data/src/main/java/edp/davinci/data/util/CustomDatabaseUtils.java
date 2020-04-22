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

package edp.davinci.data.util;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.data.pojo.CustomDatabase;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Getter;
import org.yaml.snakeyaml.Yaml;

import static edp.davinci.data.commons.Constants.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class CustomDatabaseUtils {

    private static volatile Map<String, CustomDatabase> customDatabaseMap = new HashMap<>();

    @Getter
    private static volatile Map<String, List<String>> databaseVersionMap = new HashMap<String, List<String>>();

    public static CustomDatabase getInstance(String url, String version) {
        String name = JdbcSourceUtils.getDatabase(url);
        String key = getKey(name, version);
        if (null != customDatabaseMap.get(key)) {
            CustomDatabase customDataSource = customDatabaseMap.get(key);
            if (null != customDataSource) {
                return customDataSource;
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
	public static void loadDatabase(String yamlPath) throws Exception {

        if (StringUtils.isEmpty(yamlPath)) {
            return;
        }

        File yamlFile = new File(yamlPath);
        if (!yamlFile.exists() || !yamlFile.isFile() || !yamlFile.canRead()) {
            return;
        }

        Yaml yaml = new Yaml();
        HashMap<String, Object> loads = yaml.loadAs(new BufferedReader(new FileReader(yamlFile)), HashMap.class);

        if (CollectionUtils.isEmpty(loads)) {
            return;
        }

        ObjectMapper mapper = new ObjectMapper();

        for (Map.Entry<String, Object> entry : loads.entrySet()) {

            CustomDatabase database = mapper.convertValue(entry.getValue(), CustomDatabase.class);

            if (StringUtils.isNull(database.getName())) {
                throw new Exception("Load custom datasource error: name cannot be null");
            }
            
            if (StringUtils.isNull(database.getDriver())) {
                throw new Exception("Load custom datasource error: driver cannot be null");
            }

            if (StringUtils.isNull(database.getDesc())) {
                database.setDesc(database.getName());
            }

            if (!StringUtils.isEmpty(database.getKeywordPrefix()) || !StringUtils.isEmpty(database.getKeywordSuffix())) {
                if (StringUtils.isEmpty(database.getKeywordPrefix()) || StringUtils.isEmpty(database.getKeywordSuffix())) {
                    throw new Exception("Load custom datasource error: keyword prefixes and suffixes must be configured in pairs");
                }
            }

            if (!StringUtils.isEmpty(database.getAliasPrefix()) || !StringUtils.isEmpty(database.getAliasSuffix())) {
                if (StringUtils.isEmpty(database.getAliasPrefix()) || StringUtils.isEmpty(database.getAliasSuffix())) {
                    throw new Exception("Load custom datasource error: alias prefixes and suffixes must be configured in pairs");
                }
            }

            List<String> versoins = null;
            if (databaseVersionMap.containsKey(database.getName())) {
                versoins = databaseVersionMap.get(database.getName());
            } else {
                versoins = new ArrayList<>();
            }
            if (StringUtils.isEmpty(database.getVersion())) {
                versoins.add(0, DATABASE_DEFAULT_VERSION);
            } else {
                versoins.add(database.getVersion());
            }

            if (versoins.size() == 1 && versoins.get(0).equals(DATABASE_DEFAULT_VERSION)) {
                versoins.remove(0);
            }

            databaseVersionMap.put(database.getName(), versoins);
            customDatabaseMap.put(getKey(database.getName(), database.getVersion()), database);
        }
    }

	private static String getKey(String database, String version) {
        return database + COLON + (StringUtils.isEmpty(version) ? EMPTY : version);
    }
}
