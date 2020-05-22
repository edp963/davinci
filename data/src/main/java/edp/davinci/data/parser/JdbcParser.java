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
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.core.dao.entity.User;
import edp.davinci.data.commons.Constants;
import edp.davinci.data.pojo.SqlQueryParam;
import edp.davinci.data.util.JdbcSourceUtils;
import edp.davinci.data.util.SqlParseUtils;
import edp.davinci.data.util.SqlUtils;

@Component
public class JdbcParser extends StatementParser {

    @Value("${sql_template_delimiter:$}")
    private String sqlTempDelimiter;

    @Override
    public String getParserType() {
        return "jdbc";
    }

    @Override
    public String parseSystemVars(String sql, SqlQueryParam param, Source source, User user) {
        String statement = SqlParseUtils.parseAnnotations(sql);
        statement = SqlParseUtils.parseSystemVars(statement, param.isMaintainer(), user);
        return statement;
    }

    @Override
    public String parseQueryVars(String sql, SqlQueryParam param, Map<String, Object> queryParams, Source source,
            User user) {
        char c = sqlTempDelimiter.charAt(0);
        ST st = new ST(sql, c, c);
        // replace query expression
        if (!CollectionUtils.isEmpty(queryParams)) {
            queryParams.forEach(st::add);
        }
        return st.render();
    }

    @Override
    public String parseAuthVars(String sql, SqlQueryParam param, Map<String, List<String>> authParams, Source source,
            User user) {
        String str = sql;
        Set<String> expSet = SqlParseUtils.getAuthExpression(sql, sqlTempDelimiter);
        if (!CollectionUtils.isEmpty(expSet)) {
            Map<String, String> expMap = SqlParseUtils.getAuthParsedExp(expSet, sqlTempDelimiter, authParams);
            for (String key : expMap.keySet()) {
                if (str.contains(key)) {
                    str = str.replace(key, expMap.get(key));
                }
            }
        }
        return str;
    }

    @Override
    public List<String> getExecuteStatement(String statement, SqlQueryParam param, Source source, User user) {
        return SqlParseUtils.splitSql(statement, false);
    }

    @Override
    public List<String> getQueryStatement(String statement, SqlQueryParam param, Source source, User user) {

        List<String> sqlList = SqlParseUtils.splitSql(statement, true);

        String config = source.getConfig();
        String url = JdbcSourceUtils.getUrl(config);
        String version = JdbcSourceUtils.getVersion(config);

        STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
        ST st = null;
        switch (param.getType()) {
            case "distinct":// build distinct sql
                st = stg.getInstanceOf("distinct");
                st.add("columns", param.getColumns());
                st.add("filters", SqlParseUtils.getFilters(param.getFilters(), config));
                st.add("keywordPrefix", SqlUtils.getKeywordPrefix(url, version));
                st.add("keywordSuffix", SqlUtils.getKeywordSuffix(url, version));
                break;
            default: // build query sql
                st = stg.getInstanceOf("query");
                st.add("nativeQuery", param.isNativeQuery());
                st.add("groups", param.getGroups());
                if (param.isNativeQuery()) {
                    st.add("aggregators", param.getAggregators());
                } else {
                    st.add("aggregators", SqlParseUtils.getAggregators(param.getAggregators(), url, version));
                }
                st.add("orders", SqlParseUtils.getOrders(param.getOrders(), url, version));
                st.add("filters", SqlParseUtils.getFilters(param.getFilters(), config));
                st.add("keywordPrefix", SqlUtils.getKeywordPrefix(url, version));
                st.add("keywordSuffix", SqlUtils.getKeywordSuffix(url, version));
                break;
        }

        for (int i = 0; i < sqlList.size(); i++) {
            st.add("sql", sqlList.get(i));
            sqlList.set(i, SqlParseUtils.parseSqlWithFragment(st.render()));
        }

        return sqlList;
    }

}