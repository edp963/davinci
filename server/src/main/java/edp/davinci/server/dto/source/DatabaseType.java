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

package edp.davinci.server.dto.source;

import edp.davinci.data.commons.Constants;
import edp.davinci.data.enums.DatabaseTypeEnum;
import lombok.Getter;

import java.util.List;

@Getter
public class DatabaseType {
    private String name;
    private String prefix;
    private List<String> versions;

    public DatabaseType(String name, List<String> versions) {
        this.name = name;
        this.prefix = name.equalsIgnoreCase(DatabaseTypeEnum.ORACLE.getFeature()) ? Constants.ORACLE_JDBC_URL_PREFIX : String.format(Constants.ORACLE_JDBC_URL_PREFIX, name);
        this.versions = versions;
    }
}
