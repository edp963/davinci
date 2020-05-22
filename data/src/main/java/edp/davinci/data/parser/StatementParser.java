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

package edp.davinci.data.parser;

import java.util.List;
import java.util.Map;

import edp.davinci.core.dao.entity.Source;
import edp.davinci.core.dao.entity.User;
import edp.davinci.data.pojo.SqlQueryParam;

public abstract class StatementParser {

    public abstract String getParserType();
    
    /**
     * parse view sql with system vars
     */
    public abstract String parseSystemVars(String statement, SqlQueryParam queryParam, Source source, User user);

    /**
     * parse view sql with query vars
     */
    public abstract String parseQueryVars(String statement, SqlQueryParam queryParam, Map<String, Object> queryParams, Source source, User user);

    /**
     * parse view sql with auth vars
     * if authParams is null, means no permission is needed
     * if authParams is empty, means no permission
     */
    public abstract String parseAuthVars(String statement, SqlQueryParam queryParam, Map<String, List<String>> authParams, Source source, User user);

    /**
     * get execute statement from parsed statement to do execute
     */
    public abstract List<String> getExecuteStatement(String statement, SqlQueryParam param, Source source, User user);

    /**
     * get query statement from parsed statement to do query
     */
    public abstract List<String> getQueryStatement(String statement, SqlQueryParam param, Source source, User user);
}