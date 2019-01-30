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

package edp.core.utils;

import com.alibaba.druid.util.StringUtils;
import edp.core.common.jdbc.ESDataSource;
import edp.core.common.jdbc.JdbcDataSource;
import edp.core.consts.Consts;
import edp.core.enums.DataTypeEnum;
import edp.core.enums.SqlTypeEnum;
import edp.core.enums.TypeEnum;
import edp.core.exception.ServerException;
import edp.core.exception.SourceException;
import edp.core.model.*;
import edp.davinci.core.enums.SqlColumnEnum;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.parser.CCJSqlParserManager;
import net.sf.jsqlparser.schema.Column;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.SelectExpressionItem;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Scope;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.StringReader;
import java.math.BigDecimal;
import java.sql.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@Scope("prototype")
public class SqlUtils {

    @Autowired
    private JdbcDataSource jdbcDataSource;

    @Value("${source.enable-query-log:false}")
    private boolean isQueryLogEnable;

    private String jdbcUrl;

    private String username;

    private String password;

    public SqlUtils init(BaseSource source) {
        SqlUtils sqlUtils = new SqlUtils();
        sqlUtils.jdbcDataSource = jdbcDataSource;
        sqlUtils.jdbcUrl = source.getJdbcUrl();
        sqlUtils.username = source.getUsername();
        sqlUtils.password = source.getPassword();
        sqlUtils.isQueryLogEnable = this.isQueryLogEnable;
        return sqlUtils;
    }

    public SqlUtils init(String jdbcUrl, String username, String password) {
        SqlUtils sqlUtils = new SqlUtils();
        sqlUtils.jdbcDataSource = jdbcDataSource;
        sqlUtils.jdbcUrl = jdbcUrl;
        sqlUtils.username = username;
        sqlUtils.password = password;
        sqlUtils.isQueryLogEnable = this.isQueryLogEnable;
        return sqlUtils;
    }

    public void execute(String sql) throws ServerException {
        sql = filterAnnotate(sql);
        checkSensitiveSql(sql);
        if (isQueryLogEnable) {
            log.info("execute sql >>>> {}", sql);
        }
        try {
            jdbcTemplate().execute(sql);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }
    }

    @CachePut(value = "query", key = "#sql")
    public List<Map<String, Object>> query4List(String sql, int limit) throws ServerException {
        sql = filterAnnotate(sql);
        checkSensitiveSql(sql);
        List<Map<String, Object>> list = null;
        if (isQueryLogEnable) {
            log.info("query sql >>>> {}", sql);
        }
        try {
            JdbcTemplate jdbcTemplate = jdbcTemplate();
            jdbcTemplate.setMaxRows(limit);
            list = jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }
        return list;
    }

    @CachePut(value = "query", keyGenerator = "keyGenerator")
    public Paginate<Map<String, Object>> query4Paginate(String sql, int pageNo, int pageSize, int limit) throws ServerException {


        long millis = System.currentTimeMillis();

        sql = filterAnnotate(sql);
        checkSensitiveSql(sql);
        if (isQueryLogEnable) {
            log.info("query sql >>>> {}", sql);
        }

        final Paginate<Map<String, Object>> paginate = new Paginate<>();
        try {
            if (pageNo < 1 && pageSize < 1) {
                List<Map<String, Object>> list = null;
                if (limit < 1) {
                    long l = System.currentTimeMillis();
                    list = syncQuery4List(sql);
                    long l1 = System.currentTimeMillis();
                    log.info("query for >>> : {} ms", l1 - l);
                } else {
                    long l = System.currentTimeMillis();
                    list = syncQuery4ListByLimit(sql, limit);
                    long l1 = System.currentTimeMillis();
                    log.info("query for >>> : {} ms", l1 - l);
                }
                paginate.setPageNo(1);
                paginate.setPageSize(null == list ? 0 : list.size());
                paginate.setTotalCount(null == list ? 0 : list.size());
                paginate.setResultList(list);
            } else {

                JdbcTemplate jdbcTemplate = jdbcTemplate();

                paginate.setPageNo(pageNo);
                paginate.setPageSize(pageSize);

                final int startRow = (pageNo - 1) * pageSize;
                String finalSql = sql;
                jdbcTemplate.query(new StreamingStatementCreator(finalSql), (ResultSet resultSet) -> {
                    long l = System.currentTimeMillis();

                    int total = 0;
                    try {
                        resultSet.last();
                        total = resultSet.getRow();

                        if (!resultSet.isBeforeFirst()) {
                            resultSet.beforeFirst();
                        }
                    } catch (SQLException e) {
                        log.info(">>>>>>> ResultSet Forward Only");
                        total = -1;
                    }

                    if (limit > 0) {
                        total = limit < total ? limit : total;
                    }
                    paginate.setTotalCount(total);

                    final List<Map<String, Object>> resultList = paginate.getResultList();
                    int currentRow = 0;
                    ResultSetMetaData metaData = resultSet.getMetaData();

                    while (resultSet.next() && currentRow < startRow + pageSize) {
                        if (currentRow >= startRow && (currentRow < total || total == -1)) {
                            Map<String, Object> map = new HashMap<>();
                            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                                String c = metaData.getColumnName(i);
                                Object v = resultSet.getObject(c);
                                map.put(c, v);
                            }
                            resultList.add(map);
                        }
                        currentRow++;
                    }

                    long l1 = System.currentTimeMillis();
                    log.info("query for >>> : {} ms", l1 - l);
                    return paginate;
                });
            }

        } catch (Exception e) {
            log.error(e.getMessage());
            throw new ServerException(e.getMessage());
        }


        long millis1 = System.currentTimeMillis();
        log.info("query data set for >>> : {} ms", millis1 - millis);

        return paginate;
    }


    @Cacheable(value = "query", keyGenerator = "keyGenerator", sync = true)
    public Paginate<Map<String, Object>> syncQuery4Paginate(String sql, Integer pageNo, Integer pageSize, Integer limit) throws ServerException {
        if (null == pageNo) {
            pageNo = -1;
        }
        if (null == pageSize) {
            pageSize = -1;
        }

        if (null == limit) {
            limit = -1;
        }

        Paginate<Map<String, Object>> paginate = query4Paginate(sql, pageNo, pageSize, limit);
        return paginate;
    }

    @Cacheable(value = "query", keyGenerator = "keyGenerator", sync = true)
    public List<Map<String, Object>> syncQuery4List(String sql) throws ServerException {
        List<Map<String, Object>> list = query4List(sql, -1);
        return list;
    }

    @Cacheable(value = "query", keyGenerator = "keyGenerator", sync = true)
    public List<Map<String, Object>> syncQuery4ListByLimit(String sql, int limit) throws ServerException {
        List<Map<String, Object>> list = query4List(sql, limit);
        return list;
    }


    public Map<String, Object> query4Map(String sql) throws ServerException {
        sql = filterAnnotate(sql);
        checkSensitiveSql(sql);
        Map<String, Object> map = null;
        try {
            map = jdbcTemplate().queryForMap(sql);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }
        return map;
    }

    /**
     * 获取当前数据源表结构
     *
     * @return
     * @throws SourceException
     */
    public List<TableInfo> getTableList() throws SourceException {
        List<TableInfo> tableInfoList = null;
        Connection connection = null;
        try {
            connection = getConnection();
            if (null != connection) {
                DatabaseMetaData metaData = connection.getMetaData();
                String schemaPattern = null;
                DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(this.jdbcUrl);
                if (null != dataTypeEnum && dataTypeEnum.getFeature().equals(DataTypeEnum.ORACLE.getFeature())) {
                    schemaPattern = this.username;
                    if (null != schemaPattern) {
                        schemaPattern = schemaPattern.toUpperCase();
                    }
                }
                ResultSet tables = metaData.getTables(null, schemaPattern, "%", null);
                if (null != tables) {
                    tableInfoList = new ArrayList<>();
                    while (tables.next()) {
                        String tableName = tables.getString("TABLE_NAME");
                        if (!StringUtils.isEmpty(tableName)) {
                            List<String> primaryKeys = getPrimaryKeys(tableName, metaData);
                            List<QueryColumn> columns = getColumns(tableName, metaData);
                            TableInfo tableInfo = new TableInfo(tableName, primaryKeys, columns);
                            tableInfoList.add(tableInfo);
                        }
                    }
                }
                tables.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new SourceException(e.getMessage() + ", jdbcUrl=" + this.jdbcUrl);
        } finally {
            releaseConnection(connection);
        }
        return tableInfoList;
    }


    /**
     * 判断表是否存在
     *
     * @param tableName
     * @return
     * @throws SourceException
     */
    public boolean tableIsExist(String tableName) throws SourceException {
        boolean result = false;
        Connection connection = null;
        try {
            connection = getConnection();
            if (null != connection) {
                ResultSet tables = connection.getMetaData().getTables(null, null, tableName, null);
                if (null != tables && tables.next()) {
                    result = true;
                } else {
                    result = false;
                }
                tables.close();
            }
        } catch (Exception e) {
            throw new SourceException("Get connection meta data error, jdbcUrl=" + this.jdbcUrl);
        } finally {
            releaseConnection(connection);
        }

        return result;
    }

    /**
     * 根据sql查询列
     *
     * @param sql
     * @return
     * @throws ServerException
     */
    public List<QueryColumn> getColumns(String sql) throws ServerException {
        long l = System.currentTimeMillis();
        checkSensitiveSql(sql);
        Connection connection = null;
        List<QueryColumn> columnList = new ArrayList<>();
        try {
            connection = getConnection();
            if (null != connection) {
                Statement statement = connection.createStatement();
                statement.setMaxRows(1);
                ResultSet resultSet = statement.executeQuery(sql);
                ResultSetMetaData rsmd = resultSet.getMetaData();
                int columnCount = rsmd.getColumnCount();
                for (int i = 1; i <= columnCount; i++) {
                    QueryColumn queryColumn = new QueryColumn(
                            rsmd.getColumnLabel(i),
                            TypeEnum.getType(rsmd.getColumnType(i)));
                    columnList.add(queryColumn);
                }
                resultSet.close();
                statement.close();
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        } finally {
            releaseConnection(connection);
        }
        long l1 = System.currentTimeMillis();
        log.info("get columns for >>> {} ms", l1 - l);
        return columnList;
    }


    /**
     * 获取数据表主键
     *
     * @param tableName
     * @param metaData
     * @return
     * @throws ServerException
     */
    private List<String> getPrimaryKeys(String tableName, DatabaseMetaData metaData) throws ServerException {
        ResultSet rs = null;
        List<String> primaryKeys = new ArrayList<>();
        try {
            rs = metaData.getPrimaryKeys(null, null, tableName);
            while (rs.next()) {
                primaryKeys.add(rs.getString(4));
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        } finally {
            closeResult(rs);
        }
        return primaryKeys;
    }


    /**
     * 获取数据表列
     *
     * @param tableName
     * @param metaData
     * @return
     * @throws ServerException
     */
    private List<QueryColumn> getColumns(String tableName, DatabaseMetaData metaData) throws ServerException {
        ResultSet rs = null;
        List<QueryColumn> columnList = new ArrayList<>();
        try {
            rs = metaData.getColumns(null, null, tableName, "%");
            while (rs.next()) {
                columnList.add(new QueryColumn(rs.getString(4), rs.getString(6)));
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        } finally {
            closeResult(rs);
        }
        return columnList;
    }


    /**
     * 获取数据源
     *
     * @param jdbcUrl
     * @param userename
     * @param password
     * @return
     * @throws SourceException
     */
    private DataSource getDataSource(String jdbcUrl, String userename, String password) throws SourceException {
        if (jdbcUrl.toLowerCase().indexOf(DataTypeEnum.ELASTICSEARCH.getDesc().toLowerCase()) > -1) {
            return ESDataSource.getDataSource(jdbcUrl);
        } else {
            return jdbcDataSource.getDataSource(jdbcUrl, userename, password);
        }
    }


    /**
     * 释放失效数据源
     *
     * @param jdbcUrl
     * @param userename
     * @param password
     * @return
     * @throws SourceException
     */
    private void releaseDataSource(String jdbcUrl, String userename, String password) throws SourceException {
        if (jdbcUrl.toLowerCase().indexOf(DataTypeEnum.ELASTICSEARCH.getDesc().toLowerCase()) > -1) {
            ESDataSource.removeDataSource(jdbcUrl);
        } else {
            jdbcDataSource.removeDatasource(jdbcUrl, userename);
        }
    }

    /**
     * 检查敏感操作
     *
     * @param sql
     * @throws ServerException
     */
    private void checkSensitiveSql(String sql) throws ServerException {
        Pattern pattern = Pattern.compile(Consts.REG_SENSITIVE_SQL);
        Matcher matcher = pattern.matcher(sql.toLowerCase());
        if (matcher.find()) {
            String group = matcher.group();
            log.warn("Sensitive SQL operations are not allowed: {}", group.toUpperCase());
            throw new ServerException("Sensitive SQL operations are not allowed: " + group.toUpperCase());
        }
    }

    private Connection getConnection() throws SourceException {
        DataSource dataSource = getDataSource(this.jdbcUrl, this.username, this.password);
        Connection connection = null;
        try {
            connection = dataSource.getConnection();
        } catch (Exception e) {
            connection = null;
        }
        try {
            if (null == connection || connection.isClosed() || !connection.isValid(5)) {
                log.info("connection is closed or invalid, retry get connection!");
                releaseDataSource(this.jdbcUrl, this.username, this.password);
                connection = dataSource.getConnection();
            }
        } catch (Exception e) {
            log.error("create connection error, jdbcUrl: {}", jdbcUrl);
            throw new SourceException("create connection error, jdbcUrl: " + this.jdbcUrl);
        }
        return connection;
    }

    private void releaseConnection(Connection connection) {
        if (null != connection) {
            try {
                connection.close();
                connection = null;
            } catch (Exception e) {
                e.printStackTrace();
                log.error("connection close error", e.getMessage());
            }
        }
    }


    public static void closeResult(ResultSet rs) {
        if (rs != null) {
            try {
                rs.close();
                rs = null;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public boolean testConnection() throws SourceException {
        Connection connection = null;
        try {
            connection = getConnection();
            if (null != connection) {
                return true;
            } else {
                return false;
            }
        } catch (SourceException sourceException) {
            throw sourceException;
        } finally {
            releaseConnection(connection);
        }
    }

    public JdbcTemplate jdbcTemplate() throws SourceException {
        DataSource dataSource = getDataSource(this.jdbcUrl, this.username, this.password);
        return new JdbcTemplate(dataSource);
    }

    public void executeBatch(String sql, Set<QueryColumn> headers, List<Map<String, Object>> datas) throws ServerException {

        if (StringUtils.isEmpty(sql)) {
            log.info("execute batch sql is empty");
            throw new ServerException("execute batch sql is empty");
        }

        if (null == datas || datas.size() <= 0) {
            log.info("execute batch data is empty");
            throw new ServerException("execute batch data is empty");
        }

        Connection connection = null;
        PreparedStatement pstmt = null;
        try {
            connection = getConnection();
            if (null != connection) {
                connection.setAutoCommit(false);
                pstmt = connection.prepareStatement(sql);
                //每1000条commit一次
                int n = 10000;

                for (Map<String, Object> map : datas) {
                    int i = 1;
                    for (QueryColumn queryColumn : headers) {
                        Object obj = map.get(queryColumn.getName());
                        switch (SqlColumnEnum.toJavaType(queryColumn.getType())) {
                            case "Short":
                                pstmt.setShort(i, (Short) obj);
                                break;
                            case "Integer":
                                pstmt.setInt(i, (Integer) obj);
                                break;
                            case "Long":
                                pstmt.setLong(i, (Long) obj);
                                break;
                            case "BigDecimal":
                                pstmt.setBigDecimal(i, (BigDecimal) obj);
                                break;
                            case "Float":
                                pstmt.setFloat(i, (Float) obj);
                                break;
                            case "Double":
                                pstmt.setDouble(i, (Double) obj);
                                break;
                            case "String":
                                pstmt.setString(i, (String) obj);
                                break;
                            case "Boolean":
                                pstmt.setBoolean(i, (Boolean) obj);
                                break;
                            case "Bytes":
                                pstmt.setBytes(i, (byte[]) obj);
                                break;
                            case "Date":
                                java.util.Date date = (java.util.Date) obj;
                                pstmt.setDate(i, DateUtils.toSqlDate(date));
                                break;
                            case "DateTime":
                                DateTime dateTime = (DateTime) obj;
                                pstmt.setTimestamp(i, DateUtils.toTimestamp(dateTime));
                                break;
                            case "Timestamp":
                                pstmt.setTimestamp(i, (Timestamp) obj);
                                break;
                            case "Blob":
                                pstmt.setBlob(i, (Blob) obj);
                                break;
                            case "Clob":
                                pstmt.setClob(i, (Clob) obj);
                                break;
                            default:
                                pstmt.setObject(i, obj);
                        }
                        i++;
                    }

                    pstmt.addBatch();
                    if (i % n == 0) {
                        try {
                            pstmt.executeBatch();
                            connection.commit();
                        } catch (BatchUpdateException e) {
                        }
                    }
                }

                pstmt.executeBatch();
                connection.commit();

            }
        } catch (Exception e) {
            e.printStackTrace();
            if (null != connection) {
                try {
                    connection.rollback();
                } catch (SQLException se) {
                    se.printStackTrace();
                }
            }
            throw new ServerException(e.getMessage());
        } finally {
            if (null != pstmt) {
                try {
                    pstmt.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                    throw new ServerException(e.getMessage());
                }
            }
            releaseConnection(connection);
        }
    }

    public static String getKeywordPrefix(String jdbcUrl) {
        String keywordPrefix = "";
        DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
        if (null != dataTypeEnum) {
            keywordPrefix = dataTypeEnum.getKeywordPrefix();
        } else {
            CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl);
            if (null != customDataSource) {
                keywordPrefix = customDataSource.getKeyword_prefix();
            }
        }
        return StringUtils.isEmpty(keywordPrefix) ? "" : keywordPrefix;
    }

    public static String getKeywordSuffix(String jdbcUrl) {
        String keywordSuffix = "";
        DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
        if (null != dataTypeEnum) {
            keywordSuffix = dataTypeEnum.getKeywordSuffix();
        } else {
            CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl);
            if (null != customDataSource) {
                keywordSuffix = customDataSource.getKeyword_suffix();
            }
        }
        return StringUtils.isEmpty(keywordSuffix) ? "" : keywordSuffix;
    }

    public static String getAliasPrefix(String jdbcUrl) {
        String aliasPrefix = "";
        DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
        if (null != dataTypeEnum) {
            aliasPrefix = dataTypeEnum.getAliasPrefix();
        } else {
            CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl);
            if (null != customDataSource) {
                aliasPrefix = customDataSource.getAlias_prefix();
            }
        }
        return StringUtils.isEmpty(aliasPrefix) ? "" : aliasPrefix;
    }

    public static String getAliasSuffix(String jdbcUrl) {
        String aliasSuffix = "";
        DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
        if (null != dataTypeEnum) {
            aliasSuffix = dataTypeEnum.getAliasSuffix();
        } else {
            CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl);
            if (null != customDataSource) {
                aliasSuffix = customDataSource.getAlias_suffix();
            }
        }
        return StringUtils.isEmpty(aliasSuffix) ? "" : aliasSuffix;
    }


    /**
     * 过滤sql中的注释
     *
     * @param sql
     * @return
     */
    public static String filterAnnotate(String sql) {
        Pattern p = Pattern.compile(Consts.REG_SQL_ANNOTATE);
        sql = p.matcher(sql).replaceAll("$1");
        return sql;
    }

    public static String formatSqlType(String type) throws ServerException {
        if (!StringUtils.isEmpty(type.trim())) {
            type = type.trim().toUpperCase();
            String reg = "^.*\\s*\\(.*\\)$";
            Pattern pattern = Pattern.compile(reg);
            Matcher matcher = pattern.matcher(type);
            if (!matcher.find()) {
                return SqlTypeEnum.getType(type);
            } else {
                return type;
            }
        }
        return null;
    }

    private String getCountSql(String sql) {
        try {
            CCJSqlParserManager parserManager = new CCJSqlParserManager();
            net.sf.jsqlparser.statement.Statement parse = parserManager.parse(new StringReader(sql));

            if (parse instanceof Select) {
                Select select = (Select) parse;
                PlainSelect selectBody = (PlainSelect) select.getSelectBody();
                SelectExpressionItem selectExpressionItem = new SelectExpressionItem();
                selectExpressionItem.setExpression(new Column("count(*)"));

                selectBody.setSelectItems(Arrays.asList(selectExpressionItem));
                return select.toString();
            }
        } catch (JSQLParserException e) {
            return null;
        }
        return null;
    }

}


class StreamingStatementCreator implements PreparedStatementCreator {
    private final String sql;

    public StreamingStatementCreator(String sql) {
        this.sql = sql;
    }

    @Override
    public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
        final PreparedStatement statement = connection.prepareStatement(sql, ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
        statement.setFetchSize(Integer.MIN_VALUE);
        return statement;
    }
}
