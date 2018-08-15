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

package edp.davinci.core.model;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SqlEntity {

    //查询sql
    private List<String> querySql;

    //执行sql
    private List<String> executeSql;

    private Map<String, String> quaryParams;

    private Map<String, List<String>> teamParams;

    public SqlEntity() {
    }

    public SqlEntity(List<String> querySql, List<String> executeSql, Map<String, String> quaryParams, Map<String, List<String>> teamParams) {
        this.querySql = querySql;
        this.executeSql = executeSql;
        this.quaryParams = quaryParams;
        this.teamParams = teamParams;
    }
}
