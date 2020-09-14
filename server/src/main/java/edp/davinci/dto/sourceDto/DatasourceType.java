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

package edp.davinci.dto.sourceDto;

import edp.core.consts.Consts;
import edp.core.enums.DataTypeEnum;
import lombok.Getter;

import java.util.List;

import static edp.core.consts.Consts.ORACLE_JDBC_PREFIX;

@Getter
public class DatasourceType {
    private String name;
    private String prefix;
    private List<String> versions;

    public DatasourceType(String name, List<String> versions) {
        this.name = name;
        this.prefix = name.equalsIgnoreCase(DataTypeEnum.ORACLE.getFeature()) ? ORACLE_JDBC_PREFIX : String.format(Consts.JDBC_PREFIX_FORMATTER, name);
        this.versions = versions;
    }
}
