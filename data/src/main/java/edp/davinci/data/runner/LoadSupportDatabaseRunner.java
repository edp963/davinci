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

package edp.davinci.data.runner;

import lombok.Getter;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import edp.davinci.data.enums.DatabaseTypeEnum;
import edp.davinci.data.pojo.DatabaseType;
import edp.davinci.data.util.CustomDatabaseUtils;

import static edp.davinci.data.commons.Constants.DATABASE_DEFAULT_VERSION;
import static edp.davinci.data.commons.Constants.JDBC_URL_PREFIX_FORMATER;
import static edp.davinci.data.commons.Constants.ORACLE_JDBC_URL_PREFIX;

import java.util.*;

@Order(0)
@Component
public class LoadSupportDatabaseRunner implements ApplicationRunner {

    @Getter
    private static final List<DatabaseType> supportDatabaseList = new ArrayList<>();

    @Getter
    private static final Map<String, String> supportDatabaseMap = new HashMap<>();

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Map<String, List<String>> versionMap = CustomDatabaseUtils.getDatabaseVersionMap();

        for (DatabaseTypeEnum type : DatabaseTypeEnum.values()) {
            if (versionMap.containsKey(type.getFeature())) {
                List<String> versions = versionMap.get(type.getFeature());
                if (!versions.isEmpty() && !versions.contains(DATABASE_DEFAULT_VERSION)) {
                    versions.add(0, DATABASE_DEFAULT_VERSION);
                }
            } else {
                versionMap.put(type.getFeature(), null);
            }
        }

        versionMap.forEach((name, versions) -> supportDatabaseList.add(new DatabaseType(name, versions)));

        supportDatabaseList.forEach(s -> supportDatabaseMap.put(
                s.getName(),
                s.getName().equalsIgnoreCase(DatabaseTypeEnum.ORACLE.getFeature()) ? ORACLE_JDBC_URL_PREFIX : String.format(JDBC_URL_PREFIX_FORMATER, s.getName())
        ));

        supportDatabaseList.sort(Comparator.comparing(DatabaseType::getName));
    }
}
