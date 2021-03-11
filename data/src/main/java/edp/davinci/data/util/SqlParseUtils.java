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

package edp.davinci.data.util;

import com.sun.tools.javac.util.ListBuffer;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.User;
import edp.davinci.data.commons.Constants;
import edp.davinci.data.enums.SqlOperatorEnum;
import edp.davinci.data.enums.SystemVariableEnum;
import edp.davinci.data.pojo.Aggregator;
import edp.davinci.data.pojo.Criterion;
import edp.davinci.data.pojo.Filter;
import edp.davinci.data.pojo.Order;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import org.springframework.beans.BeanUtils;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static edp.davinci.commons.Constants.*;

//import static edp.davinci.data.commons.Constants.PATTERN_SENSITIVE_SQL;

@Slf4j
public class SqlParseUtils {

    private static final String SELECT = "select";
    private static final String WITH = "with";
    private static final String OR = "or";

    private static final String QUERY_WHERE_TRUE = "1=1";
    private static final String QUERY_WHERE_FALSE = "1=0";
    private static final String QUERY_WHERE_VALUE = "'%s'";

    public static final String REG_IGNORE_CASE = "(?i)";

    public static final String REG_SYSVAR = "[a-zA-Z0-9_.\\-`\"'\\u4e00-\\u9fa5]+\\s*[\\!=]{1,2}\\s*['\"\\[]?%s['\"\\]]?";
    public static final String REG_AUTHVAR = "\\([a-zA-Z0-9_.\\-`\"'[\\u4e00-\\u9fa5]*]+\\s*[\\s\\w<>!=]*\\s*[a-zA-Z0-9_.\\-]*((\\(%s[a-zA-Z0-9_]+%s\\))|(%s[a-zA-Z0-9_]+%s))+\\s*\\)";
    public static final String REG_CRITERION = "^'.*?'$";

    public static final String REG_WITH_SQL_FRAGMENT = "((?i)WITH[\\s\\S]+(?i)AS?\\s*\\([\\s\\S]+\\))\\s*(?i)SELECT";
    public static final Pattern PATTERN_WITH_SQL_FRAGMENT = Pattern.compile(REG_WITH_SQL_FRAGMENT);

    public static final String REG_SQL_ANNOTATION = "(?ms)('(?:''|[^'])*')|--.*?$|/\\*[^+]*?\\*/";
    public static final Pattern PATTERN_SQL_ANNOTATION = Pattern.compile(REG_SQL_ANNOTATION);

    public static String parseAnnotations(String sql) {
        return PATTERN_SQL_ANNOTATION.matcher(sql).replaceAll("$1").replace(NEW_LINE, SPACE).replaceAll("(;+\\s*)+",
                SEMICOLON);
    }

    public static String parseSystemVars(String sql, boolean isMaintainer, User user) {

        if (isMaintainer) {
            return replaceSystemVars(sql, QUERY_WHERE_TRUE, null);
        }

        if (user == null) {
            return replaceSystemVars(sql, QUERY_WHERE_FALSE, null);
        }

        return replaceSystemVars(sql, null, user);
    }

    private static String replaceSystemVars(String sql, String condition, User user) {
        if (StringUtils.isEmpty(condition) && user == null) {
            return sql;
        }

        if (sql.toUpperCase().contains(SystemVariableEnum.USER_ID.getKey())) {
            String regex = condition != null ? String.format(REG_SYSVAR, SystemVariableEnum.USER_ID.getRegex())
                    : SystemVariableEnum.USER_ID.getRegex();
            String repl = user == null ? condition : user.getId().toString();
            sql = sql.replaceAll(REG_IGNORE_CASE + regex, repl);
        }

        if (sql.toUpperCase().contains(SystemVariableEnum.USER_NAME.getKey())) {
            String regex = condition != null ? String.format(REG_SYSVAR, SystemVariableEnum.USER_NAME.getRegex())
                    : SystemVariableEnum.USER_NAME.getRegex();
            String repl = user == null ? condition : String.format(QUERY_WHERE_VALUE, user.getName());
            sql = sql.replaceAll(REG_IGNORE_CASE + regex, repl);
        }

        if (sql.toUpperCase().contains(SystemVariableEnum.USER_USERNAME.getKey())) {
            String regex = condition != null ? String.format(REG_SYSVAR, SystemVariableEnum.USER_USERNAME.getRegex())
                    : SystemVariableEnum.USER_USERNAME.getRegex();
            String repl = user == null ? condition : String.format(QUERY_WHERE_VALUE, user.getUsername());
            sql = sql.replaceAll(REG_IGNORE_CASE + regex, repl);
        }

        if (sql.toUpperCase().contains(SystemVariableEnum.USER_EMAIL.getKey())) {
            String regex = condition != null ? String.format(REG_SYSVAR, SystemVariableEnum.USER_EMAIL.getRegex())
                    : SystemVariableEnum.USER_EMAIL.getRegex();
            String repl = user == null ? condition : String.format(QUERY_WHERE_VALUE, user.getUsername());
            sql = sql.replaceAll(REG_IGNORE_CASE + regex, repl);
        }

        if (sql.toUpperCase().contains(SystemVariableEnum.USER_DEPARTMENT.getKey())) {
            String regex = condition != null ? String.format(REG_SYSVAR, SystemVariableEnum.USER_DEPARTMENT.getRegex())
                    : SystemVariableEnum.USER_DEPARTMENT.getRegex();
            String repl = user == null ? condition : String.format(QUERY_WHERE_VALUE, user.getUsername());
            sql = sql.replaceAll(REG_IGNORE_CASE + regex, repl);
        }
        
        return sql;
    }

    public static Set<String> getAuthExpression(String sql, String sqlTempDelimiter) {
        Pattern p = Pattern.compile(getAuthRegExp(REG_AUTHVAR, sqlTempDelimiter));
        Set<String> expressions = new HashSet<>();

        Set<String> authVarFragments = new HashSet<>();
        Deque<String> deque = new ArrayDeque<>();
        deque.push(sql);
        while (!deque.isEmpty()) {
            Matcher matcher = p.matcher(deque.pop());
            while (matcher.find()) {
                String group = matcher.group();
                if (isSelectStatement(group)) {
                    if (group.startsWith(PARENTHESES_START)) {
                        group = group.substring(1);
                    }
                    if (group.endsWith(PARENTHESES_CLOSE)) {
                        group = group.substring(0, group.length() - 1);
                    }
                    deque.push(group);
                } else {
                    authVarFragments.add(group);
                }
            }
        }

        for (String fragment : authVarFragments) {
            Arrays.stream(SqlOperatorEnum.values()).filter(e -> fragment.toUpperCase().contains(e.getValue()))
                    .findFirst().ifPresent(v -> {
                        expressions.add(fragment);
                    });
        }

        return expressions;
    }

    public static boolean isSelectStatement(String src) {
        if (StringUtils.isEmpty(src)) {
            return false;
        }
        try {
            Statement parse = CCJSqlParserUtil.parse(src);
            return parse instanceof Select;
        } catch (JSQLParserException e) {
            return false;
        }
    }
    
    private static String getAuthRegExp(String express, String sqlTempDelimiter) {
        String arg = sqlTempDelimiter;
        arg = "\\" + arg;
        return String.format(express, arg, arg, arg, arg);
    }

    public static Map<String, String> getAuthParsedExp(Set<String> expSet, String sqlTempDelimiter, Map<String, List<String>> authParams) {
		Iterator<String> iterator = expSet.iterator();
		Map<String, String> parseMap = new HashMap<>();
		while (iterator.hasNext()) {
			String exp = iterator.next().trim();
			try {
				parseMap.put(exp, getAuthVarExp(exp, sqlTempDelimiter, authParams));
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return parseMap;
    }
    
    private static String getAuthVarExp(String exp, String sqlTempDelimiter, Map<String, List<String>> authParams) throws Exception {

		if (null == authParams) {
			return QUERY_WHERE_TRUE;
		}

		if (StringUtils.isEmpty(exp)) {
			return "";
		}

		String authExp = "";
		exp = exp.trim();

		// auth expression must be enclosed in parentheses, so get rid of the parentheses first
		if (exp.startsWith(PARENTHESES_START) && exp.endsWith(PARENTHESES_CLOSE)) {
			exp = exp.substring(1, exp.length() - 1);
		}

		String sql = String.format(Constants.JDBC_SELECT_SQL_FORMATTER, exp);
		Select select = (Select) CCJSqlParserUtil.parse(sql);
		PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
		Expression where = plainSelect.getWhere();

		ListBuffer<Map<SqlOperatorEnum, List<String>>> listBuffer = new ListBuffer<>();
		where.accept(SqlOperatorEnum.getVisitor(listBuffer));
		Map<SqlOperatorEnum, List<String>> operatorMap = listBuffer.toList().head;

		for (SqlOperatorEnum sqlOperator : operatorMap.keySet()) {
			List<String> expList = operatorMap.get(sqlOperator);
			if (CollectionUtils.isEmpty(expList)) {
				continue;
			}
			String left = operatorMap.get(sqlOperator).get(0);
			String right = operatorMap.get(sqlOperator).get(expList.size() - 1);
			if (right.startsWith(PARENTHESES_START) && right.endsWith(PARENTHESES_CLOSE)) {
				right = right.substring(1, right.length() - 1);
			}
			if (right.startsWith(sqlTempDelimiter) && right.endsWith(sqlTempDelimiter)) {
				right = right.substring(1, right.length() - 1);
			}
			if (authParams.containsKey(right.trim())) {
				List<String> list = authParams.get(right.trim());
				if (!CollectionUtils.isEmpty(list)) {
					StringBuilder expBuilder = new StringBuilder();
					if (list.size() == 1) {
						String v = list.get(0);
						if (!StringUtils.isEmpty(v)) {
							if (v.equals(Constants.NO_AUTH_PERMISSION)) {
								return QUERY_WHERE_FALSE;
							} else {
								if (sqlOperator == SqlOperatorEnum.IN) {
									expBuilder.append(left).append(SPACE).append(SqlOperatorEnum.IN.getValue())
											.append(SPACE).append(list.stream().collect(
													Collectors.joining(COMMA, PARENTHESES_START, PARENTHESES_CLOSE)));
								} else {
									if (v.split(COMMA).length > 1) {
										expBuilder.append(left).append(SPACE).append(SqlOperatorEnum.IN.getValue())
												.append(SPACE).append(list.stream().collect(
														Collectors.joining(COMMA, PARENTHESES_START, PARENTHESES_CLOSE)));
									} else {
										expBuilder.append(left).append(SPACE).append(sqlOperator.getValue())
												.append(SPACE).append(v);
									}
								}
							}

						} else {
							return QUERY_WHERE_TRUE;
						}
					} else {
						List<String> collect = list.stream().filter(s -> !s.contains(Constants.NO_AUTH_PERMISSION))
								.collect(Collectors.toList());
						switch (sqlOperator) {
							case IN:
							case EQUALSTO:
								expBuilder.append(left).append(SPACE).append(SqlOperatorEnum.IN.getValue())
										.append(SPACE).append(collect.stream().collect(
												Collectors.joining(COMMA, PARENTHESES_START, PARENTHESES_CLOSE)));
								break;

							case NOTEQUALSTO:
								expBuilder.append(left).append(SPACE).append(SqlOperatorEnum.NOTIN.getValue())
										.append(SPACE).append(collect.stream().collect(
												Collectors.joining(COMMA, PARENTHESES_START, PARENTHESES_CLOSE)));
								break;

							case BETWEEN:
							case GREATERTHAN:
							case GREATERTHANEQUALS:
							case MINORTHAN:
							case MINORTHANEQUALS:
								expBuilder.append(collect.stream()
										.map(x -> SPACE + left + SPACE + SqlOperatorEnum.BETWEEN.getValue() + SPACE + x
												+ SPACE)
										.collect(Collectors.joining(OR, PARENTHESES_START, PARENTHESES_CLOSE)));
								break;

							default:
								expBuilder.append(authExp);
								break;
						}
					}
					return expBuilder.toString();
				} else {
					return QUERY_WHERE_TRUE;
				}
			} else {
				Set<String> keySet = authParams.keySet();
				String finalRight = right.trim();
				List<String> keys = keySet.stream().filter(finalRight::contains).collect(Collectors.toList());
				if (!CollectionUtils.isEmpty(keys)) {
					String k = keys.get(0);
					List<String> list = authParams.get(k);
					String v = "";
					if (!CollectionUtils.isEmpty(list)) {
						String s = String.join(COMMA, list);
						v = right.replace(sqlTempDelimiter + k + sqlTempDelimiter, s);

					}
					return String.join(EMPTY, left, SPACE, sqlOperator.getValue(), SPACE, v);
				} else {
					return QUERY_WHERE_FALSE;
				}
			}
		}
		return authExp;
    }


    public static List<Order> getOrders(List<Order> orders, String jdbcUrl, String dbVersion) {
        
        if (CollectionUtils.isEmpty(orders)) {
            return null;
        }

        List<Order> list = new ArrayList<>();
        String prefix = SqlUtils.getKeywordPrefix(jdbcUrl, dbVersion);
        String suffix = SqlUtils.getKeywordSuffix(jdbcUrl, dbVersion);

        for (Order order : orders) {
            String column = order.getColumn().trim();
            StringBuilder columnBuilder = new StringBuilder();
            if (!column.startsWith(prefix)) {
                columnBuilder.append(prefix);
            }
            columnBuilder.append(column);
            if (!column.endsWith(suffix)) {
                columnBuilder.append(suffix);
            }
            order.setColumn(columnBuilder.toString());
            list.add(order);
        }
        
        return list;
    }
    
    public static List<String> getAggregators(List<Aggregator> aggregators, String jdbcUrl, String dbVersion) {
        if (CollectionUtils.isEmpty(aggregators)) {
            return null;
        }
        return aggregators.stream()
                .map(a -> parseColumn(a.getColumn(), a.getFunc(), jdbcUrl, dbVersion, false))
                .collect(Collectors.toList());
    }

    private static String parseColumn(String column, String func, String jdbcUrl, String dbVersion, boolean isLable) {
        if (isLable) {
            return String.join(EMPTY, func.trim(), PARENTHESES_START, column.trim(), PARENTHESES_CLOSE);
        } else {
            StringBuilder sb = new StringBuilder();
            if ("COUNTDISTINCT".equals(func.trim().toUpperCase())) {
                sb.append("COUNT").append(PARENTHESES_START).append("DISTINCT").append(SPACE);
                sb.append(getColumn(column, SqlUtils.getKeywordPrefix(jdbcUrl, dbVersion), SqlUtils.getKeywordSuffix(jdbcUrl, dbVersion)));
                sb.append(PARENTHESES_CLOSE);
                sb.append(" AS ").append(SqlUtils.getAliasPrefix(jdbcUrl, dbVersion)).append("COUNTDISTINCT").append(PARENTHESES_START);
                sb.append(column);
                sb.append(PARENTHESES_CLOSE).append(SqlUtils.getAliasSuffix(jdbcUrl, dbVersion));
            } else {
                sb.append(func.trim()).append(PARENTHESES_START);
                sb.append(getColumn(column, SqlUtils.getKeywordPrefix(jdbcUrl, dbVersion), SqlUtils.getKeywordSuffix(jdbcUrl, dbVersion)));
                sb.append(PARENTHESES_CLOSE);
                sb.append(" AS ").append(SqlUtils.getAliasPrefix(jdbcUrl, dbVersion));
                sb.append(func.trim()).append(PARENTHESES_START);
                sb.append(column);
                sb.append(PARENTHESES_CLOSE).append(SqlUtils.getAliasSuffix(jdbcUrl, dbVersion));
            }
            return sb.toString();
        }
    }

    private static String getColumn(String column, String keywordPrefix, String keywordSuffix) {
        
        if (!StringUtils.isEmpty(keywordPrefix) && !StringUtils.isEmpty(keywordSuffix)) {
            return keywordPrefix + column + keywordSuffix;
        }
        
        return column;
    }

    public static List<String> getFilters(List<Filter> filters, String jdbcUrl, String dbVersion) {
        
        List<String> list = null;
        
        try {
            
            if (CollectionUtils.isEmpty(filters)) {
                return null;
            }

            list = new ArrayList<>();

            String keywordPrefix = SqlUtils.getKeywordPrefix(jdbcUrl, dbVersion);
            String keywordSuffix = SqlUtils.getKeywordSuffix(jdbcUrl, dbVersion);
            for (Filter filter : filters) {
                Filter f = new Filter();
                // keep the original value 
                BeanUtils.copyProperties(filter, f);
                list.add(parseFilter(f, keywordPrefix, keywordSuffix));
            }

        } catch (Exception e) {
            log.error("Convert filters error, url={}, version={}, filters={}, whereClauses={}", jdbcUrl, dbVersion,
                    JSONUtils.toString(filters), JSONUtils.toString(list));
            throw e;
        }
        
        return list;
    }

    private static String parseFilter(Filter filter, String keywordPrefix, String keywordSuffix){
        StringBuilder condition = new StringBuilder();
        String type = filter.getType();

        if(Filter.TYPE_FILTER.equalsIgnoreCase(type)){
            condition.append(parseOperator(filter, keywordPrefix, keywordSuffix));
        }

        if(Filter.TYPE_RELATION.equalsIgnoreCase(type)){
            List<Filter> children = filter.getChildren();
            condition.append(PARENTHESES_START);
            for(int i=0; i<children.size(); i++){
                condition.append(i == 0 ? parseFilter(children.get(i), keywordPrefix, keywordSuffix) : SPACE + filter.getValue().toString() + SPACE + parseFilter(children.get(i), keywordPrefix, keywordSuffix));
            }
            condition.append(PARENTHESES_CLOSE);
        }

        return condition.toString();
    }

    private static String parseOperator(Filter filter, String keywordPrefix, String keywordSuffix){
        String name = filter.getName();
        Object value = filter.getValue();
        String operator = filter.getOperator();
        String sqlType = filter.getSqlType();

        Criterion criterion;
        if (SqlOperatorEnum.BETWEEN.getValue().equalsIgnoreCase(operator)) {
            List values = (List) value;
            criterion = new Criterion(name, operator, values.get(0), values.get(1), sqlType);
        } else {
            criterion = new Criterion(name, operator, value, sqlType);
        }

        return parseCriterion(criterion, keywordPrefix, keywordSuffix);
    }

    private static String parseCriterion(Criterion criterion, String keywordPrefix, String keywordSuffix){
        StringBuilder whereClause = new StringBuilder();
        
        String column = criterion.getColumn();
        if (!StringUtils.isEmpty(keywordPrefix) && !StringUtils.isEmpty(keywordSuffix)) {
            column = keywordPrefix + column + keywordSuffix;
        }
        
        if (criterion.isSingleValue()) {
            // column='value'
            String value = criterion.getValue().toString();
            whereClause.append(column + SPACE + criterion.getOperator() + SPACE);
            if (criterion.isNeedQuotes() && !Pattern.matches(REG_CRITERION, value)) {
                whereClause.append(SINGLE_QUOTES + value + SINGLE_QUOTES);
            } else {
                whereClause.append(value);
            }

        } else if (criterion.isBetweenValue()) {
            // column>='' and column<=''
            String value = criterion.getValue().toString();
            whereClause.append(PARENTHESES_START);
            whereClause.append(column + SPACE + SqlOperatorEnum.GREATERTHANEQUALS.getValue() + SPACE);
            if (criterion.isNeedQuotes() && !Pattern.matches(REG_CRITERION, value)) {
                whereClause.append(SINGLE_QUOTES + value + SINGLE_QUOTES);
            } else {
                whereClause.append(value);
            }
            whereClause.append(SPACE + Filter.TYPE_AND + SPACE);
            whereClause.append(column + SPACE + SqlOperatorEnum.MINORTHANEQUALS.getValue() + SPACE);
            value = criterion.getSecondValue().toString();
            if (criterion.isNeedQuotes() && !Pattern.matches(REG_CRITERION, value)) {
                whereClause.append(SINGLE_QUOTES + value + SINGLE_QUOTES);
            } else {
                whereClause.append(value);
            }
            whereClause.append(PARENTHESES_CLOSE);

        } else if (criterion.isListValue()) {
            List values = (List) criterion.getValue();
            whereClause.append(column + SPACE + criterion.getOperator() + SPACE);
            whereClause.append(PARENTHESES_START);
            if (criterion.isNeedQuotes() && !Pattern.matches(REG_CRITERION, values.get(0).toString())) {
                whereClause.append(SINGLE_QUOTES + StringUtils.join(values, SINGLE_QUOTES + COMMA + SINGLE_QUOTES)
                        + SINGLE_QUOTES);
            } else {
                whereClause.append(StringUtils.join(values, COMMA));
            }
            whereClause.append(PARENTHESES_CLOSE);
        }
        return whereClause.toString();
    }
    
    public static List<String> splitSql(String sql, boolean isQuery) {

        String str = StringUtils.isEmpty(sql) ? null : sql.trim();

		if (StringUtils.isEmpty(str)) {
			return null;
        }
        
		if (str.startsWith(SEMICOLON)) {
			str = str.substring(1);
		}

		if (str.endsWith(SEMICOLON)) {
			str = str.substring(0, str.length() - 1);
		}

		List<String> list = null;

		String[] strArr = str.split(SEMICOLON);
		if (strArr.length > 0) {
			list = new ArrayList<>();
			for (String s : strArr) {
                s = s.trim();
				boolean select = isQuerySql(s);
				if (isQuery) {
					if (select) {
						list.add(s);
					}
				} else {
					if (!select) {
                        checkSensitiveSql(s);
						list.add(s);
					}
				}
			}
        }
		return list;
    }

    private static boolean isQuerySql(String sql) {
        if (sql.toLowerCase().startsWith(SELECT) || sql.toLowerCase().startsWith(WITH)) {
            return true;
        }

        String temp = parseAnnotations(sql).trim();
        return temp.toLowerCase().startsWith(SELECT) || temp.toLowerCase().startsWith(WITH);
    }

    private static void checkSensitiveSql(String sql) {
//         Matcher matcher = PATTERN_SENSITIVE_SQL.matcher(sql.toLowerCase());
//         if (matcher.find()) {
//             String group = matcher.group();
//             log.warn("Sensitive SQL operations are not allowed:{}", group.toUpperCase());
//             throw new RuntimeException("Sensitive SQL operations are not allowed:" + group.toUpperCase());
//         }
    }
    
    public static String parseSqlWithFragment(String sql) {
		if (!sql.toLowerCase().startsWith(WITH)) {
			Matcher matcher = PATTERN_WITH_SQL_FRAGMENT.matcher(sql);
			if (matcher.find()) {
				String withFragment = matcher.group();
				if (!StringUtils.isEmpty(withFragment)) {
					if (withFragment.length() > 6) {
						int lastSelectIndex = withFragment.length() - 6;
						sql = sql.replace(withFragment, withFragment.substring(lastSelectIndex));
						withFragment = withFragment.substring(0, lastSelectIndex);
					}
					sql = withFragment + SPACE + sql;
					sql = sql.replaceAll(SPACE + "{2,}", SPACE);
				}
			}
		}
		return sql;
	}

}