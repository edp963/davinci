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
import com.sun.tools.javac.util.ListBuffer;
import edp.core.exception.ServerException;
import edp.core.utils.SqlUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.SqlOperatorEnum;
import edp.davinci.core.model.SqlEntity;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import org.apache.ibatis.jdbc.Null;
import org.stringtemplate.v4.ST;

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

    private static final String REG_TEAMVAR = "\\([a-zA-Z0-9_]{1,}\\s?\\w*[<>!=]*\\s?\\(?%s\\w+%s\\)?\\s?\\)";

    /**
     * 解析sql
     *
     * @param sqlStr
     * @return
     */
    public static SqlEntity parseSql(String sqlStr, String sqlTempDelimiter) throws ServerException {
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
            }

            Map<String, String> queryParamMap = new HashMap<>();
            Map<String, List<String>> teamParamMap = new HashMap<>();
            //参数
            if (!StringUtils.isEmpty(queryParam)) {
                queryParam = queryParam.replaceAll(newLineChar, space).trim();
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
                                String k = paramArray[0].trim().replace(String.valueOf(getSqlTempDelimiter(sqlTempDelimiter)), "");
                                String v = paramArray.length > 1 ? paramArray[1].trim() : null;
                                log.info("query param >>>>>>: {}  ->  {}", k.replace(String.valueOf(getSqlTempDelimiter(sqlTempDelimiter)), ""), v);
                                queryParamMap.put(k, v);
                            }
                        } else if (param.startsWith(teamVarKey)) {
                            param = param.replaceAll(teamVarKey, "");
                            String[] paramArray = param.trim().split(String.valueOf(assignmentChar));
                            if (null != paramArray && paramArray.length > 0) {
                                String k = paramArray[0].trim();
                                String v = paramArray.length > 1 ? paramArray[1].trim() : null;
                                log.info("team param >>>>>>: {}  ->  {}", k.replace(String.valueOf(getSqlTempDelimiter(sqlTempDelimiter)), ""), v);
                                teamParamMap.put(k, Arrays.asList(v));
                            }
                        }
                    }
                }
            }

            if (StringUtils.isEmpty(sqlStruct)) {
                throw new ServerException("Invalid Query Sql");
            }

            sqlStruct = sqlStruct.replaceAll(newLineChar, space);

            SqlEntity sqlEntity = new SqlEntity(sqlStruct, queryParamMap, teamParamMap);
            return sqlEntity;
        }
        return null;
    }

    /**
     * 替换参数
     *
     * @param sql
     * @param queryParamMap
     * @param teamParamMap
     * @param sqlTempDelimiter
     * @return
     */
    public static String replaceParams(String sql, Map<String, String> queryParamMap, Map<String, List<String>> teamParamMap, String sqlTempDelimiter) {
        if (StringUtils.isEmpty(sql)) {
            return null;
        }

        char delimiter = getSqlTempDelimiter(sqlTempDelimiter);

        //替换team@var
        if (null != teamParamMap && teamParamMap.size() > 0) {
            Pattern p = Pattern.compile(getTeamVarReg(delimiter));
            Set<String> expSet = new HashSet<>();
            Matcher matcher = p.matcher(sql);
            while (matcher.find()) {
                expSet.add(matcher.group());
            }
            if (expSet.size() > 0) {
                Map<String, String> parsedMap = getParsedExpression(expSet, teamParamMap, delimiter);
                for (String key : parsedMap.keySet()) {
                    if (sql.indexOf(key) > -1) {
                        sql = sql.replace(key, parsedMap.get(key));
                    }
                }
            }
        }

        ST st = new ST(sql, delimiter, delimiter);
        //替换query@var
        if (null != queryParamMap && queryParamMap.size() > 0) {
            for (String key : queryParamMap.keySet()) {
                st.add(key, queryParamMap.get(key));
            }
        }
        sql = st.render();
        return sql;
    }


    public static List<String> getExecuteSqlList(String sql) {
        if (StringUtils.isEmpty(sql)) {
            return null;
        }

        List<String> list = null;

        String[] split = sql.split(sqlSeparator);
        if (null != split && split.length > 0) {
            list = new ArrayList<>();
            for (String sqlStr : split) {
                sqlStr = sqlStr.trim();
                if (sqlStr.toLowerCase().startsWith(select)) {
                    continue;
                } else {
                    list.add(sqlStr);
                }
            }
        }
        return list;
    }


    public static List<String> getQuerySqlList(String sql) {
        if (StringUtils.isEmpty(sql)) {
            return null;
        }
        List<String> list = null;
        String[] split = sql.split(sqlSeparator);
        if (null != split && split.length > 0) {
            list = new ArrayList<>();
            for (String sqlStr : split) {
                sqlStr = sqlStr.trim();
                if (sqlStr.toLowerCase().startsWith(select)) {
                    list.add(sqlStr);
                } else {
                    continue;
                }
            }
        }
        return list;
    }


    private static Map<String, String> getParsedExpression(Set<String> expSet, Map<String, List<String>> teamParamMap, char sqlTempDelimiter) {
        Iterator<String> iterator = expSet.iterator();
        Map<String, String> map = new HashMap<>();
        while (iterator.hasNext()) {
            String exp = iterator.next().trim();
            try {
                map.put(exp, getTeamVarExpression(exp, teamParamMap, sqlTempDelimiter));
            } catch (Exception e) {
                e.printStackTrace();
                continue;
            }
        }
        if (map.size() > 0) {
            return map;
        } else {
            return null;
        }
    }

    private static String getTeamVarExpression(String srcExpression, Map<String, List<String>> teamParamMap, char sqlTempDelimiter) throws Exception {
        String originExpression = srcExpression;
        if (!StringUtils.isEmpty(srcExpression)) {
            srcExpression = srcExpression.trim();
            if (srcExpression.startsWith(parenthesesStart) && srcExpression.endsWith(parenthesesEnd)) {
                srcExpression = srcExpression.substring(1, srcExpression.length() - 1);
            }

            String sql = String.format(Constants.SELECT_EXEPRESSION, srcExpression);
            Select select = (Select) CCJSqlParserUtil.parse(sql);
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            Expression where = plainSelect.getWhere();

            ListBuffer<Map<SqlOperatorEnum, List<String>>> listBuffer = new ListBuffer<>();
            where.accept(SqlOperatorEnum.getVisitor(listBuffer));
            Map<SqlOperatorEnum, List<String>> operatorMap = listBuffer.toList().head;

            for (SqlOperatorEnum sqlOperator : operatorMap.keySet()) {
                List<String> expList = operatorMap.get(sqlOperator);
                if (null != expList && expList.size() > 0) {
                    String left = operatorMap.get(sqlOperator).get(0);
                    String right = operatorMap.get(sqlOperator).get(expList.size() - 1);
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
        }
        return originExpression;
    }


    public static char getSqlTempDelimiter(String sqlTempDelimiter) {
        return sqlTempDelimiter.charAt(sqlTempDelimiter.length() - 1);
    }


    private static String getTeamVarReg(char delimiter) {
        String arg = String.valueOf(delimiter);
        if (delimiter == dollarDelimiter) {
            arg = "\\" + arg;
        }
        return String.format(REG_TEAMVAR, arg, arg);
    }
}
