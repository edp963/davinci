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

package edp.core.utils;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import edp.core.model.DataSourceDriver;
import org.yaml.snakeyaml.Yaml;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

public class DataSourceDriverLoadUtils {


    /**
     * 根据url 加载yaml中的数据源驱动
     *
     * @param url
     * @return
     * @throws Exception
     */
    public static DataSourceDriver loadFromYaml(String yamlPath, String url) throws Exception {
        if (StringUtils.isEmpty(url)) {
            return null;
        }
        Map<String, DataSourceDriver> sourceDriverMap = loadAllFromYaml(yamlPath);
        if (null == sourceDriverMap || sourceDriverMap.size() < 1) {
            return null;
        }

        for (String key : sourceDriverMap.keySet()) {
            DataSourceDriver dataSourceDriver = sourceDriverMap.get(key);
            if (StringUtils.isEmpty(dataSourceDriver.getName()) || StringUtils.isEmpty(dataSourceDriver.getDriver())) {
                continue;
            }
            if ("null".equals(dataSourceDriver.getName().trim().toLowerCase())) {
                continue;
            }
            if ("null".equals(dataSourceDriver.getDriver().trim().toLowerCase())) {
                continue;
            }

            if (StringUtils.isEmpty(dataSourceDriver.getDesc())) {
                dataSourceDriver.setDesc(dataSourceDriver.getName());
            }
            if ("null".equals(dataSourceDriver.getDesc().trim().toLowerCase())) {
                dataSourceDriver.setDesc(dataSourceDriver.getName());
            }

            if (url.toLowerCase().indexOf(dataSourceDriver.getName().trim().toLowerCase()) > -1) {
                try {
                    Class<?> aClass = Class.forName(dataSourceDriver.getDriver());
                    if (null == aClass) {
                        throw new Exception("Unable to get driver instance for jdbcUrl: " + url);
                    }
                } catch (ClassNotFoundException e) {
                    throw new Exception("Unable to get driver instance: " + url);
                }
                return dataSourceDriver;
            }
        }
        return null;
    }

    private static Map<String, DataSourceDriver> loadAllFromYaml(String yamlPath) {
        if (StringUtils.isEmpty(yamlPath)) {
            return null;
        }
        File yamlFile = new File(yamlPath);
        if (!yamlFile.exists()) {
            return null;
        }
        if (!yamlFile.isFile()) {
            return null;
        }
        if (!yamlFile.canRead()) {
            return null;
        }

        FileReader fileReader = null;
        try {
            fileReader = new FileReader(yamlFile);
        } catch (FileNotFoundException e) {
            return null;
        }
        if (null == fileReader) {
            return null;
        }

        Yaml yaml = new Yaml();
        HashMap<String, Object> map = yaml.loadAs(new BufferedReader(fileReader), HashMap.class);
        Map<String, DataSourceDriver> dataTypeMap = null;
        if (null != map && map.size() > 0) {
            dataTypeMap = new HashMap<>();
            ObjectMapper mapper = new ObjectMapper();
            for (String key : map.keySet()) {
                DataSourceDriver dataSourceDriver = mapper.convertValue(map.get(key), DataSourceDriver.class);
                dataTypeMap.put(key, dataSourceDriver);
            }
        }
        return dataTypeMap;
    }
}
