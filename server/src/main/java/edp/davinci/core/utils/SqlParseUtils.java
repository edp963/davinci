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

package edp.davinci.core.utils;

import com.alibaba.druid.util.StringUtils;
import com.sun.tools.javac.util.ListBuffer;
import edp.core.exception.ServerException;
import edp.core.utils.CollectionUtils;
import edp.core.utils.SqlUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.SqlOperatorEnum;
import edp.davinci.core.enums.SqlVariableTypeEnum;
import edp.davinci.core.enums.SqlVariableValueTypeEnum;
import edp.davinci.core.model.SqlEntity;
import edp.davinci.model.SqlVariable;
import edp.davinci.model.SqlVariableChannel;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.stringtemplate.v4.ST;

import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.*;
import static edp.davinci.core.common.Constants.*;

@Slf4j
@Component
public class SqlParseUtils {

    private static final String SELECT = "select";

    private static final String WITH = "with";

    @Autowired
    private DacChannelUtil dacChannelUtil;

    /**
     * 解析sql
     *
     * @param sqlStr
     * @return
     */
    public SqlEntity parseSql(String sqlStr, List<SqlVariable> variables, String sqlTempDelimiter) throws ServerException {
        if (StringUtils.isEmpty(sqlStr.trim())) {
            return null;
        }

        sqlStr = SqlUtils.filterAnnotate(sqlStr);
        sqlStr = sqlStr.replaceAll(NEW_LINE_CHAR, SPACE).trim();

        char delimiter = getSqlTempDelimiter(sqlTempDelimiter);

        Pattern p = Pattern.compile(getReg(REG_SQL_PLACEHOLDER, delimiter, false));
        Matcher matcher = p.matcher(sqlStr);

        if (!matcher.find()) {
            return new SqlEntity(sqlStr, null, null);
        }

        Map<String, Object> queryParamMap = new ConcurrentHashMap<>();
        Map<String, List<String>> authParamMap = new Hashtable<>();

        //解析参数
        if (!CollectionUtils.isEmpty(variables)) {
            ExecutorService executorService = Executors.newFixedThreadPool(8);
            try {
                CountDownLatch countDownLatch = new CountDownLatch(variables.size());
                List<Future> futures = new ArrayList<>(variables.size());
                variables.forEach(variable -> futures.add(executorService.submit(() -> {
                    try {
                        SqlVariableTypeEnum typeEnum = SqlVariableTypeEnum.typeOf(variable.getType());
                        if (null != typeEnum) {
                            switch (typeEnum) {
                                case QUERYVAR:
                                    queryParamMap.put(variable.getName().trim(), SqlVariableValueTypeEnum.getValues(variable.getValueType(), variable.getDefaultValues(), variable.isUdf()));
                                    break;
                                case AUTHVARE:
                                    if (null != variable) {
                                        List<String> v = getAuthVarValue(variable, null);
                                        authParamMap.put(variable.getName().trim(), null == v ? new ArrayList<>() : v);
                                    }
                                    break;
                            }
                        }
                    } finally {
                        countDownLatch.countDown();
                    }
                })));

                try {
                    for (Future future : futures) {
                        future.get();
                    }
                    countDownLatch.await();
                } catch (ExecutionException e) {
                    executorService.shutdownNow();
                    throw (ServerException) e.getCause();
                }

            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                executorService.shutdown();
            }
        }
        return new SqlEntity(sqlStr, queryParamMap, authParamMap);
    }


    public List<String> getAuthVarValue(SqlVariable variable, String email) {
        SqlVariableChannel channel = variable.getChannel();
        if (null == channel) {
            return SqlVariableValueTypeEnum.getValues(variable.getValueType(), variable.getDefaultValues(), variable.isUdf());
        } else if (DacChannelUtil.dacMap.containsKey(channel.getName())) {
            if (StringUtils.isEmpty(email)) {
                return null;
            }
            List<Object> data = dacChannelUtil.getData(channel.getName(), channel.getBizId().toString(), email);
            return SqlVariableValueTypeEnum.getValues(variable.getValueType(), data, variable.isUdf());
        }
        return new ArrayList<>();
    }

    /**
     * 替换参数
     *
     * @param sql
     * @param queryParamMap
     * @param authParamMap
     * @param sqlTempDelimiter
     * @return
     */
    public String replaceParams(String sql, Map<String, Object> queryParamMap, Map<String, List<String>> authParamMap, String sqlTempDelimiter) {
        if (StringUtils.isEmpty(sql)) {
            return null;
        }

        char delimiter = getSqlTempDelimiter(sqlTempDelimiter);

        //替换auth@var
        Pattern p = Pattern.compile(getReg(REG_AUTHVAR, delimiter, true));
        Matcher matcher = p.matcher(sql);

        Map<String, List<SqlOperatorEnum>> operatorMap = Arrays.stream(SqlOperatorEnum.values()).collect(Collectors.groupingBy(e -> e.getValue()));

        Set<String> expSet = new HashSet<>();
        while (matcher.find()) {
            String group = matcher.group();
            for (String key : operatorMap.keySet()) {
                if (group.toUpperCase().contains(key)) {
                    expSet.add(group);
                }
            }
        }
        if (!CollectionUtils.isEmpty(expSet)) {
            Map<String, String> parsedMap = getParsedExpression(expSet, authParamMap, delimiter);
            for (String key : parsedMap.keySet()) {
                if (sql.indexOf(key) > -1) {
                    sql = sql.replace(key, parsedMap.get(key));
                }
            }
        }

        ST st = new ST(sql, delimiter, delimiter);
        if (!CollectionUtils.isEmpty(authParamMap) && !CollectionUtils.isEmpty(expSet)) {
            authParamMap.forEach((k, v) -> st.add(k, true));
        }
        //替换query@var
        if (!CollectionUtils.isEmpty(queryParamMap)) {
            queryParamMap.forEach(st::add);
        }
        sql = st.render();
        return sql;
    }


    public List<String> getSqls(String sql, boolean isQuery) {
        sql = sql.trim();

        if (StringUtils.isEmpty(sql)) {
            return null;
        }

        if (sql.startsWith(SEMICOLON)) {
            sql = sql.substring(1);
        }

        if (sql.endsWith(SEMICOLON)) {
            sql = sql.substring(0, sql.length() - 1);
        }

        List<String> list = null;

        String[] split = sql.split(SEMICOLON);
        if (null != split && split.length > 0) {
            list = new ArrayList<>();
            for (String sqlStr : split) {
                sqlStr = sqlStr.trim();
                boolean select = sqlStr.toLowerCase().startsWith(SELECT) || sqlStr.toLowerCase().startsWith(WITH);
                if (isQuery) {
                    if (select) {
                        list.add(sqlStr);
                    } else {
                        continue;
                    }
                } else {
                    if (!select) {
                        list.add(sqlStr);
                    } else {
                        continue;
                    }
                }
            }
        }
        return list;
    }


    private static Map<String, String> getParsedExpression(Set<String> expSet, Map<String, List<String>> authParamMap, char sqlTempDelimiter) {
        Iterator<String> iterator = expSet.iterator();
        Map<String, String> map = new HashMap<>();
        while (iterator.hasNext()) {
            String exp = iterator.next().trim();
            try {
                map.put(exp, getAuthVarExpression(exp, authParamMap, sqlTempDelimiter));
            } catch (Exception e) {
                e.printStackTrace();
                continue;
            }
        }
        return !CollectionUtils.isEmpty(map) ? map : null;
    }

    private static String getAuthVarExpression(String srcExpression, Map<String, List<String>> authParamMap, char sqlTempDelimiter) throws Exception {

        if (null == authParamMap) {
            return "1=1";
        }

        String originExpression = "";
        if (!StringUtils.isEmpty(srcExpression)) {
            srcExpression = srcExpression.trim();
            if (srcExpression.startsWith(PARENTHESES_START) && srcExpression.endsWith(PARENTHESES_END)) {
                srcExpression = srcExpression.substring(1, srcExpression.length() - 1);
            }

            String sql = String.format(Constants.SELECT_EXEPRESSION, srcExpression);
            Select select = (Select) CCJSqlParserUtil.parse(sql);
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            Expression where = plainSelect.getWhere();

            ListBuffer<Map<SqlOperatorEnum, List<String>>> listBuffer = new ListBuffer<>();
            where.accept(SqlOperatorEnum.getVisitor(listBuffer));
            Map<SqlOperatorEnum, List<String>> operatorMap = listBuffer.toList().head;

            String delimiter = String.valueOf(sqlTempDelimiter);

            for (SqlOperatorEnum sqlOperator : operatorMap.keySet()) {
                List<String> expList = operatorMap.get(sqlOperator);
                if (!CollectionUtils.isEmpty(expList)) {
                    String left = operatorMap.get(sqlOperator).get(0);
                    String right = operatorMap.get(sqlOperator).get(expList.size() - 1);
                    if (right.startsWith(PARENTHESES_START) && right.endsWith(PARENTHESES_END)) {
                        right = right.substring(1, right.length() - 1);
                    }
                    if (right.startsWith(delimiter) && right.endsWith(delimiter)) {
                        right = right.substring(1, right.length() - 1);
                    }
                    if (authParamMap.containsKey(right.trim())) {
                        List<String> list = authParamMap.get(right.trim());
                        if (!CollectionUtils.isEmpty(list)) {
                            StringBuilder expBuilder = new StringBuilder();
                            if (list.size() == 1) {
                                String v = list.get(0);
                                if (!StringUtils.isEmpty(v)) {
                                    if (v.equals(N0_AUTH_PERMISSION)) {
                                        return "1=0";
                                    } else {
                                        switch (sqlOperator) {
                                            case IN:
                                                expBuilder
                                                        .append(left).append(SPACE)
                                                        .append(SqlOperatorEnum.IN.getValue()).append(SPACE)
                                                        .append(list.stream().collect(Collectors.joining(COMMA, PARENTHESES_START, PARENTHESES_END)));
                                                break;
                                            default:
                                                if (v.split(",").length > 1) {
                                                    expBuilder
                                                            .append(left).append(SPACE)
                                                            .append(SqlOperatorEnum.IN.getValue()).append(SPACE)
                                                            .append(list.stream().collect(Collectors.joining(COMMA, PARENTHESES_START, PARENTHESES_END)));
                                                } else {
                                                    expBuilder
                                                            .append(left).append(SPACE)
                                                            .append(sqlOperator.getValue()).append(SPACE).append(v);
                                                }
                                                break;
                                        }
                                    }

                                } else {
                                    return "1=1";
                                }
                            } else {
                                List<String> collect = list.stream().filter(s -> !s.contains(N0_AUTH_PERMISSION)).collect(Collectors.toList());
                                switch (sqlOperator) {
                                    case IN:
                                    case EQUALSTO:
                                        expBuilder
                                                .append(left).append(SPACE)
                                                .append(SqlOperatorEnum.IN.getValue()).append(SPACE)
                                                .append(collect.stream().collect(Collectors.joining(COMMA, PARENTHESES_START, PARENTHESES_END)));
                                        break;

                                    case NOTEQUALSTO:
                                        expBuilder
                                                .append(left).append(SPACE)
                                                .append(SqlOperatorEnum.NoTIN.getValue()).append(SPACE)
                                                .append(collect.stream().collect(Collectors.joining(COMMA, PARENTHESES_START, PARENTHESES_END)));
                                        break;

                                    case BETWEEN:
                                    case GREATERTHAN:
                                    case GREATERTHANEQUALS:
                                    case MINORTHAN:
                                    case MINORTHANEQUALS:
                                        expBuilder.append(collect.stream()
                                                .map(x -> SPACE + left + SPACE + SqlOperatorEnum.BETWEEN.getValue() + SPACE + x + SPACE)
                                                .collect(Collectors.joining("or", PARENTHESES_START, PARENTHESES_END)));
                                        break;

                                    default:
                                        expBuilder.append(originExpression);
                                        break;
                                }
                            }
                            return expBuilder.toString();
                        } else {
                            return "1=1";
                        }
                    } else {
                        Set<String> keySet = authParamMap.keySet();
                        String finalRight = right.trim();
                        List<String> keys = keySet.stream().filter(finalRight::contains).collect(Collectors.toList());
                        if (!CollectionUtils.isEmpty(keys)) {
                            String k = keys.get(0);
                            List<String> list = authParamMap.get(k);
                            String v = "";
                            if (!CollectionUtils.isEmpty(list)) {
                                String s = list.stream().collect(Collectors.joining(COMMA));
                                v = right.replace(delimiter + k + delimiter, s);

                            }
                            return String.join(EMPTY, left, SPACE, sqlOperator.getValue(), SPACE, v);
                        } else {
                            return "1=0";
                        }
                    }
                }
            }
        }
        return originExpression;
    }
}
