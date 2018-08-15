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

package edp.davinci.core.utils;

import com.alibaba.druid.util.StringUtils;
import edp.core.exception.ServerException;
import edp.core.utils.SqlUtils;
import edp.davinci.core.enums.SqlOperatorEnum;
import edp.davinci.core.model.SqlEntity;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Alias;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.parser.CCJSqlParserManager;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.SelectExpressionItem;
import net.sf.jsqlparser.statement.select.SubSelect;

import java.io.StringReader;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
public class SqlParseUtils {


    /**
     * 特殊符号定义
     */


    private static final String conditionSeparator = ",";

    private static final String space = " ";

    private static final String sqlSeparator = ";";

    private static final String sqlUrlSeparator = "&";

    private static final String newLineChar = "\n";

    private static final char CSVHeaderSeparator = ':';

    private static final char delimiterStartChar = '<';

    private static final String parenthesesStart = "(";

    private static final String parenthesesEnd = ")";

    private static final char delimiterEndChar = '>';

    private static final char assignmentChar = '=';

    public static final char dollarDelimiter = '$';

    private static final char STStartChar = '{';

    private static final char STEndChar = '}';

    private static final String REG_SQL_STRUCT = "[{].*[}]";

    private static final String select = "select";

    private static final String queryVarKey = "query@var";

    private static final String teamVarKey = "team@var";

    private static final String REG_PLACEHOLDER = "\\$.+\\$";

    private static final String REG_TEAMVAR = "\\([a-zA-Z0-9_]{1,}\\s?\\w*[<>!=]*\\s?\\(?\\$\\w+\\$\\)?\\s?\\)";

    /**
     * 解析sql
     *
     * @param sqlStr
     * @return
     */
    public static SqlEntity parseSql(String sqlStr) throws ServerException {
        if (!StringUtils.isEmpty(sqlStr.trim())) {
            log.info("original sql >>>>>>: {}", sqlStr);
            //过滤注释
            sqlStr = SqlUtils.filterAnnotate(sqlStr);
            log.info("after filter annotate sql >>>>>>: {}", sqlStr);

            //sql体
            String sqlStruct = null, queryParam = null;
            //Pattern.DOTALL+Pattern.MULTILINE : 在正则表达式中的'.'可以代替所有字符，包括换行符\n
            Pattern p = Pattern.compile(REG_SQL_STRUCT, Pattern.DOTALL + Pattern.MULTILINE);
            Matcher matcher = p.matcher(sqlStr);
            if (matcher.find()) {
                sqlStruct = matcher.group();
                queryParam = matcher.replaceAll("");
            } else {
                throw new ServerException("You have an error in your SQL syntax;");
            }

            List<String> querySqlList = null, executeSqlList = null;

            //sql体
            if (!StringUtils.isEmpty(sqlStruct.trim())) {
                sqlStruct = sqlStruct.trim();

                if (sqlStruct.startsWith(String.valueOf(STStartChar))) {
                    sqlStruct = sqlStruct.substring(1);
                }
                if (sqlStruct.endsWith(String.valueOf(STEndChar))) {
                    sqlStruct = sqlStruct.substring(0, sqlStruct.length() - 1);
                }
                if (sqlStruct.endsWith(sqlSeparator)) {
                    sqlStruct = sqlStruct.substring(0, sqlStruct.length() - 1);
                }
                log.info("after structed sql >>>>>>: {}", sqlStruct);

                String[] split = sqlStruct.split(sqlSeparator);
                if (null != split && split.length > 0) {
                    querySqlList = new ArrayList<>();
                    executeSqlList = new ArrayList<>();
                    for (String sql : split) {
                        sql = sql.trim();
                        if (StringUtils.isEmpty(sql)) {
                            continue;
                        }
                        if (sql.toLowerCase().startsWith(select)) {
                            querySqlList.add(sql);
                            log.info("query sql >>>>>>: {}", sql);
                        } else {
                            executeSqlList.add(sql);
                            log.info("execute sql >>>>>>: {}", sql);
                        }
                    }
                }
            }

            Map<String, String> queryParamMap = new HashMap<>();
            Map<String, List<String>> teamParamMap = new HashMap<>();
            //参数
            if (!StringUtils.isEmpty(queryParam)) {
                queryParam = queryParam.replaceAll(newLineChar, "").trim();
                if (queryParam.endsWith(sqlSeparator)) {
                    queryParam = queryParam.substring(0, queryParam.length() - 1);
                }
                String[] split = queryParam.split(sqlSeparator);
                if (null != split && split.length > 0) {
                    for (String param : split) {
                        param = param.trim();
                        if (param.startsWith(queryVarKey)) {
                            param = param.replaceAll(queryVarKey, "");
                            String[] paramArray = param.trim().split(String.valueOf(assignmentChar));
                            if (null != paramArray && paramArray.length > 0) {
                                String k = paramArray[0].trim();
                                String v = paramArray.length > 1 ? paramArray[1].trim() : "";
                                log.info("query param >>>>>>: {}  ->  {}", k.replace(String.valueOf(dollarDelimiter), ""), v);
                                queryParamMap.put(k, v);
                            }
                        } else if (param.startsWith(teamVarKey)) {
                            param = param.replaceAll(teamVarKey, "");
                            String[] paramArray = param.trim().split(String.valueOf(assignmentChar));
                            if (null != paramArray && paramArray.length > 0) {
                                String k = paramArray[0].trim();
                                String v = paramArray.length > 1 ? paramArray[1].trim() : "";
                                log.info("team param >>>>>>: {}  ->  {}", k.replace(String.valueOf(dollarDelimiter), ""), v);
                                teamParamMap.put(k, Arrays.asList(v));
                            }
                        }
                    }
                }
            }

            if (null == querySqlList || querySqlList.size() <= 0) {
                throw new ServerException("Invalid Query Sql");
            }

            SqlEntity sqlEntity = new SqlEntity(
                    querySqlList,
                    executeSqlList,
                    queryParamMap,
                    teamParamMap
            );
            return sqlEntity;
        }
        return null;
    }


    /**
     * 替换参数
     *
     * @param sqlList
     * @param queryParamMap
     * @return
     */
    public static List<String> replaceParams(List<String> sqlList, Map<String, String> queryParamMap, Map<String, List<String>> teamParamMap) {
        if (null != sqlList && sqlList.size() > 0) {
            //替换team@var
            if (null != teamParamMap && teamParamMap.size() > 0) {
                Pattern p = Pattern.compile(REG_TEAMVAR);
                Set<String> expSet = new HashSet<>();
                for (String sql : sqlList) {
                    Matcher matcher = p.matcher(sql);
                    while (matcher.find()) {
                        expSet.add(matcher.group());
                    }
                }
                if (expSet.size() > 0) {
                    Map<String, String> parsedMap = getParsedExpression(expSet, teamParamMap);
                    for (String sql : sqlList) {
                        for (String key : parsedMap.keySet()) {
                            if (sql.indexOf(key) > -1) {
                                int position = sqlList.indexOf(sql);
                                sql = sql.replace(key, parsedMap.get(key));
                                sqlList.set(position, sql);
                            }
                        }
                    }
                }
            }


            //替换query@var
            if (null != queryParamMap && queryParamMap.size() > 0) {
                Pattern p = Pattern.compile(REG_PLACEHOLDER);
                for (String sql : sqlList) {
                    Matcher matcher = p.matcher(sql);
                    if (matcher.find()) {
                        for (String key : queryParamMap.keySet()) {
                            int position = sqlList.indexOf(sql);
                            sql = sql.replace(key, queryParamMap.get(key));
                            sqlList.set(position, sql);
                        }
                    }
                }
            }
        }
        return sqlList;
    }


    private static Map<String, String> getParsedExpression(Set<String> expSet, Map<String, List<String>> teamParamMap) {
        Iterator<String> iterator = expSet.iterator();
        Map<String, String> map = new HashMap<>();
        while (iterator.hasNext()) {
            String exp = iterator.next().trim();
            SqlOperatorEnum sqlOperator = SqlOperatorEnum.getSqlOperator(exp);
            String expression = getTeamVarExpression(sqlOperator, exp, teamParamMap);
            map.put(exp, expression);
        }
        if (map.size() > 0) {
            return map;
        } else {
            return null;
        }
    }

    private static String getTeamVarExpression(SqlOperatorEnum sqlOperator, String srcExpression, Map<String, List<String>> teamParamMap) {
        String originExpression = srcExpression;
        if (!StringUtils.isEmpty(srcExpression)) {
            srcExpression = srcExpression.trim();
            if (srcExpression.startsWith(parenthesesStart) && srcExpression.endsWith(parenthesesEnd)) {
                srcExpression = srcExpression.substring(1, srcExpression.length() - 1);
            }
            String[] split = srcExpression.split(sqlOperator.getValue());
            if (split.length == 2) {
                String left = split[0].trim();
                String right = split[1].trim();
                if (teamParamMap.containsKey(right)) {
                    StringBuilder expBuilder = new StringBuilder();
                    List<String> list = teamParamMap.get(right);
                    if (null != list && list.size() > 0) {
                        if (list.size() == 1) {
                            expBuilder
                                    .append(left).append(space)
                                    .append(sqlOperator.getValue()).append(space).append(list.get(0));
                        } else {
                            switch (sqlOperator) {
                                case IN:
                                case EQUALSTO:
                                    expBuilder
                                            .append(left).append(space)
                                            .append(SqlOperatorEnum.IN.getValue()).append(space)
                                            .append(list.stream().collect(Collectors.joining(",", "(", ")")));
                                    break;

                                case NOTEQUALSTO:
                                    expBuilder
                                            .append(left).append(space)
                                            .append(SqlOperatorEnum.NoTIN.getValue()).append(space)
                                            .append(list.stream().collect(Collectors.joining(",", "(", ")")));
                                    break;

                                case BETWEEN:
                                case GREATERTHAN:
                                case GREATERTHANEQUALS:
                                case MINORTHAN:
                                case MINORTHANEQUALS:
                                    expBuilder.append(list.stream()
                                            .map(x -> space + left + space + SqlOperatorEnum.BETWEEN.getValue() + space + x + space)
                                            .collect(Collectors.joining("or", "(", ")")));
                                    break;

                                default:
                                    expBuilder.append(originExpression);
                                    break;
                            }
                        }
                    }
                    return expBuilder.toString();
                }
            }
        }
        return originExpression;
    }

    /**
     * 获取查询操作的最外层wehre 条件
     *
     * @param sql
     * @return
     * @throws JSQLParserException
     */
    public static String getSelectWhere(String sql) throws JSQLParserException {
        CCJSqlParserManager parserManager = new CCJSqlParserManager();
        Select select = (Select) parserManager.parse(new StringReader(sql));
        PlainSelect plain = (PlainSelect) select.getSelectBody();
        Expression where_expression = plain.getWhere();
        if (null != where_expression) {
            return where_expression.toString();
        }
        return null;
    }


    /**
     * 构造子查询
     *
     * @param sql
     * @return
     * @throws JSQLParserException
     */
    public static PlainSelect buildSubSelect(String sql) throws JSQLParserException {
        CCJSqlParserManager parserManager = new CCJSqlParserManager();
        Select select = (Select) parserManager.parse(new StringReader(sql));
        PlainSelect plainSelect = new PlainSelect();
        SubSelect subSelect = new SubSelect();
        subSelect.setAlias(new Alias("T"));
        subSelect.setSelectBody(select.getSelectBody());
        plainSelect.setFromItem(subSelect);
        return plainSelect;
    }

    /**
     * 构建查询列
     *
     * @param plainSelect
     * @param fields
     * @return
     * @throws JSQLParserException
     */
    public static PlainSelect buildSelectFields(PlainSelect plainSelect, List<String> fields)
            throws JSQLParserException {
        plainSelect.setSelectItems(null);
        for (String field : fields) {
            plainSelect.addSelectItems(new SelectExpressionItem(CCJSqlParserUtil.parseExpression(field)));
        }
        return plainSelect;
    }


    /**
     * 构建group
     *
     * @param plainSelect
     * @param groups
     * @return
     * @throws JSQLParserException
     */
    public static PlainSelect buildSelectGroupby(PlainSelect plainSelect, List<String> groups) throws JSQLParserException {
        List<Expression> GroupByColumnReferences = new ArrayList<>();
        for (String group : groups) {
            GroupByColumnReferences.add(CCJSqlParserUtil.parseExpression(group));
        }
        plainSelect.setGroupByColumnReferences(GroupByColumnReferences);
        return plainSelect;
    }

}
