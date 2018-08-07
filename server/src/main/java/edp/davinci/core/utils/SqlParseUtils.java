package edp.davinci.core.utils;

import com.alibaba.druid.util.StringUtils;
import edp.core.exception.ServerException;
import edp.core.utils.SqlUtils;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
public class SqlParseUtils {


    /**
     * 特殊符号定义
     */


    private static final String conditionSeparator = ",";

    private static final String sqlSeparator = ";";

    private static final String sqlUrlSeparator = "&";

    private static final char newLineChar = '\n';

    private static final char CSVHeaderSeparator = ':';

    private static final char delimiterStartChar = '<';

    private static final char delimiterEndChar = '>';

    private static final char assignmentChar = '=';

    public static final char dollarDelimiter = '$';

    private static final char STStartChar = '{';

    private static final char STEndChar = '}';

    private static final String REG_SQL_STRUCT = "[{].*[}]";

    private static final String select = "select";

    private static final String paramKey = "query@var";

    private static final String REG_PLACEHOLDER = "\\$.+\\$";

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
//                sqlStruct = sqlStruct.replaceAll(String.valueOf(newLineChar), " ").trim();
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

            Map<String, String> paramMap = new HashMap<>();
            //参数
            if (!StringUtils.isEmpty(queryParam)) {
//                queryParam = queryParam.replaceAll(String.valueOf(newLineChar), " ").trim();
                queryParam = queryParam.trim();
                if (queryParam.endsWith(sqlSeparator)) {
                    queryParam = queryParam.substring(0, queryParam.length() - 1);
                }
                queryParam = queryParam.replaceAll(paramKey, "");
                String[] split = queryParam.split(sqlSeparator);
                if (null != split && split.length > 0) {
                    for (String param : split) {
                        String[] paramArray = param.trim().split(String.valueOf(assignmentChar));
                        if (null != paramArray && paramArray.length > 0) {
                            String k = paramArray[0].trim();
                            String v = paramArray.length > 1 ? paramArray[1].trim() : "";
                            log.info("query param >>>>>>: {}  ->  {}", k.replace(String.valueOf(dollarDelimiter), ""), v);
                            paramMap.put(k, v);
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
                    paramMap
                    );
            return sqlEntity;
        }
        return null;
    }


    /**
     * 替换参数
     *
     * @param sqlList
     * @param paramMap
     * @return
     */
    public static List<String> replaceParams(List<String> sqlList, Map<String, String> paramMap) {
        if (null != sqlList && sqlList.size() > 0 && null != paramMap && paramMap.size() > 0) {
            Pattern p = Pattern.compile(REG_PLACEHOLDER);
            for (String sql : sqlList) {
                Matcher matcher = p.matcher(sql);
                if (matcher.find()) {
                    for (String key : paramMap.keySet()) {
                        int position = sqlList.indexOf(sql);
                        sql = sql.replace(key, paramMap.get(key));
                        sqlList.set(position, sql);
                    }
                }
            }
        }
        return sqlList;
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

//    public static String buildSelectWhere(String sql, List<Param> )
//            throws JSQLParserException {
//        CCJSqlParserManager parserManager = new CCJSqlParserManager();
//        Select select = (Select) parserManager.parse(new StringReader(sql));
//        PlainSelect plain = (PlainSelect) select.getSelectBody();
//        Expression where_expression = (Expression) (CCJSqlParserUtil
//                .parseCondExpression(str_where));
//        plain.setWhere(where_expression);
//        return select.toString();
//    }

    /**
     * 构造子查询
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
     * @param plainSelect
     * @param groups
     * @return
     * @throws JSQLParserException
     */
    public static PlainSelect buildSelectGroupby(PlainSelect plainSelect, List<String> groups) throws JSQLParserException {
        List<Expression> GroupByColumnReferences = new ArrayList<>();
        for (String group: groups) {
            GroupByColumnReferences.add(CCJSqlParserUtil.parseExpression(group));
        }
        plainSelect.setGroupByColumnReferences(GroupByColumnReferences);
        return plainSelect;
    }

}
