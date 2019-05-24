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
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.SqlColumnEnum;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Scope;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.jdbc.support.rowset.SqlRowSetMetaData;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static edp.core.consts.Consts.*;

@Slf4j
@Component
@Scope("prototype")
public class SqlUtils {
    private static final Logger sqlLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SQL.getName());

    @Autowired
    private JdbcDataSource jdbcDataSource;

    @Value("${source.result-limit:1000000}")
    private int resultLimit;

    @Value("${source.enable-query-log:false}")
    private boolean isQueryLogEnable;

    private String jdbcUrl;

    private String username;

    private String password;

    private DataTypeEnum dataTypeEnum;

    public SqlUtils init(BaseSource source) {
        SqlUtils sqlUtils = new SqlUtils();
        sqlUtils.jdbcDataSource = jdbcDataSource;
        sqlUtils.jdbcUrl = source.getJdbcUrl();
        sqlUtils.username = source.getUsername();
        sqlUtils.password = source.getPassword();
        sqlUtils.isQueryLogEnable = this.isQueryLogEnable;
        sqlUtils.resultLimit = this.resultLimit;
        sqlUtils.dataTypeEnum = DataTypeEnum.urlOf(source.getJdbcUrl());
        return sqlUtils;
    }

    public SqlUtils init(String jdbcUrl, String username, String password) {
        SqlUtils sqlUtils = new SqlUtils();
        sqlUtils.jdbcDataSource = jdbcDataSource;
        sqlUtils.jdbcUrl = jdbcUrl;
        sqlUtils.username = username;
        sqlUtils.password = password;
        sqlUtils.isQueryLogEnable = this.isQueryLogEnable;
        sqlUtils.resultLimit = this.resultLimit;
        sqlUtils.dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
        return sqlUtils;
    }

    public void execute(String sql) throws ServerException {
        sql = filterAnnotate(sql);
        checkSensitiveSql(sql);
        if (isQueryLogEnable) {
            sqlLogger.info("{}", sql);
        }
        try {
            jdbcTemplate().execute(sql);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }
    }

    @CachePut(value = "query", key = "#sql")
    public List<Map<String, Object>> query4List(String sql, int limit) throws Exception {
        sql = filterAnnotate(sql);
        checkSensitiveSql(sql);
        String md5 = MD5Util.getMD5(sql, true, 16);
        if (isQueryLogEnable) {
            sqlLogger.info("{}  >> \n{}", md5, sql);
        }
        JdbcTemplate jdbcTemplate = jdbcTemplate();
        jdbcTemplate.setMaxRows(limit > resultLimit ? resultLimit : limit);

        long befor = System.currentTimeMillis();

        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql);

        if (isQueryLogEnable) {
            sqlLogger.info("{} query for >> {} ms", md5, System.currentTimeMillis() - befor);
        }

        return list;
    }

    @CachePut(value = "query", keyGenerator = "keyGenerator")
    public PaginateWithQueryColumns query4Paginate(String sql, int pageNo, int pageSize, int totalCount, int limit, Set<String> excludeColumns) throws Exception {
        PaginateWithQueryColumns paginateWithQueryColumns = new PaginateWithQueryColumns();
        sql = filterAnnotate(sql);
        checkSensitiveSql(sql);

        String md5 = MD5Util.getMD5(sql + pageNo + pageSize + limit, true, 16);

        long befor = System.currentTimeMillis();

        JdbcTemplate jdbcTemplate = jdbcTemplate();
        jdbcTemplate.setMaxRows(resultLimit);

        if (pageNo < 1 && pageSize < 1) {

            if (limit > 0) {
                resultLimit = limit > resultLimit ? resultLimit : limit;
            }
            if (isQueryLogEnable) {
                sqlLogger.info("{}  >> \n{}", md5, sql);
            }
            jdbcTemplate.setMaxRows(resultLimit);
            getResultForPaginate(sql, paginateWithQueryColumns, jdbcTemplate, excludeColumns);
            paginateWithQueryColumns.setPageNo(1);
            int size = paginateWithQueryColumns.getResultList().size();
            paginateWithQueryColumns.setPageSize(size);
            paginateWithQueryColumns.setTotalCount(size);
        } else {
            paginateWithQueryColumns.setPageNo(pageNo);
            paginateWithQueryColumns.setPageSize(pageSize);

            final int startRow = (pageNo - 1) * pageSize;

            if (pageNo == 1 || totalCount == 0) {
                totalCount = jdbcTemplate.<Integer>queryForObject(getCountSql(sql), Integer.class);
            }
            if (limit > 0) {
                limit = limit > resultLimit ? resultLimit : limit;
                totalCount = limit < totalCount ? limit : totalCount;
            }

            paginateWithQueryColumns.setTotalCount(totalCount);
            int maxRows = limit > 0 && limit < pageSize * pageNo ? limit : pageSize * pageNo;

            switch (this.dataTypeEnum) {
                case MYSQL:
                    sql = sql + " LIMIT " + startRow + ", " + pageSize;
                    md5 = MD5Util.getMD5(sql, true, 16);
                    if (isQueryLogEnable) {
                        sqlLogger.info("{}  >> \n{}", md5, sql);
                    }
                    getResultForPaginate(sql, paginateWithQueryColumns, jdbcTemplate, excludeColumns);
                    break;
                case MOONBOX:
                    if (isQueryLogEnable) {
                        sqlLogger.info("{}  >> \n{}", md5, sql);
                    }
                    jdbcTemplate.setMaxRows(maxRows);
                    jdbcTemplate.query(sql, getPaginateResultSetExtractor(paginateWithQueryColumns, startRow, excludeColumns));
                    break;
                default:
                    if (isQueryLogEnable) {
                        sqlLogger.info("{}  >> \n{}", md5, sql);
                    }
                    jdbcTemplate.setMaxRows(maxRows);
                    jdbcTemplate.query(new StreamingStatementCreator(sql, this.dataTypeEnum),
                            getPaginateResultSetExtractor(paginateWithQueryColumns, startRow, excludeColumns));
                    break;
            }
        }

        if (isQueryLogEnable) {
            sqlLogger.info("{} query for >> {} ms", md5, System.currentTimeMillis() - befor);
        }

        return paginateWithQueryColumns;
    }


    private String getCountSql(String sql) {
        try {
            Select select = (Select) CCJSqlParserUtil.parse(sql);
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            plainSelect.setOrderByElements(null);
            return String.format(QUERY_COUNT_SQL, select.toString());
        } catch (JSQLParserException e) {
        }
        return String.format(Consts.QUERY_COUNT_SQL, sql);
    }

    private void getResultForPaginate(String sql, PaginateWithQueryColumns paginateWithQueryColumns, JdbcTemplate jdbcTemplate, Set<String> excludeColumns) {
        SqlRowSet sqlRowSet = jdbcTemplate.queryForRowSet(sql);
        if (null != sqlRowSet) {
            SqlRowSetMetaData metaData = sqlRowSet.getMetaData();

            List<QueryColumn> queryColumns = new ArrayList<>();
            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                String key = metaData.getColumnLabel(i);
                if (!CollectionUtils.isEmpty(excludeColumns) && excludeColumns.contains(key)) {
                    continue;
                }
                queryColumns.add(new QueryColumn(key, metaData.getColumnTypeName(i)));
            }
            paginateWithQueryColumns.setColumns(queryColumns);

            List<Map<String, Object>> resultList = new ArrayList<>();
            while (sqlRowSet.next()) {
                Map<String, Object> map = new LinkedHashMap<>();
                for (int i = 1; i <= metaData.getColumnCount(); i++) {
                    String key = metaData.getColumnLabel(i);
                    if (!CollectionUtils.isEmpty(excludeColumns) && excludeColumns.contains(key)) {
                        continue;
                    }
                    map.put(key, sqlRowSet.getObject(key));
                }
                resultList.add(map);
            }
            paginateWithQueryColumns.setResultList(resultList);
        }
    }

    private ResultSetExtractor<PaginateWithQueryColumns> getPaginateResultSetExtractor(PaginateWithQueryColumns paginateWithQueryColumns, int startRow, Set<String> excludeColumns) {
        return (ResultSet resultSet) -> {
            final List<Map<String, Object>> resultList = paginateWithQueryColumns.getResultList();
            ResultSetMetaData metaData = resultSet.getMetaData();

            List<QueryColumn> queryColumns = new ArrayList<>();
            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                String c = metaData.getColumnLabel(i);
                if (!CollectionUtils.isEmpty(excludeColumns) && excludeColumns.contains(c)) {
                    continue;
                }
                queryColumns.add(new QueryColumn(c, metaData.getColumnTypeName(i)));
            }

            paginateWithQueryColumns.setColumns(queryColumns);

            resultSet.absolute(startRow);
            while (resultSet.next()) {
                Map<String, Object> map = new HashMap<>();
                for (int i = 1; i <= metaData.getColumnCount(); i++) {
                    String c = metaData.getColumnLabel(i);
                    if (!CollectionUtils.isEmpty(excludeColumns) && excludeColumns.contains(c)) {
                        continue;
                    }
                    Object v = resultSet.getObject(c);
                    map.put(c, v);
                }
                resultList.add(map);
            }

            resultSet.close();
            return paginateWithQueryColumns;
        };
    }


    @Cacheable(value = "query", keyGenerator = "keyGenerator", sync = true)
    public PaginateWithQueryColumns syncQuery4Paginate(String sql, Integer pageNo, Integer pageSize, Integer totalCount, Integer limit, Set<String> excludeColumns) throws Exception {
        if (null == pageNo) {
            pageNo = -1;
        }
        if (null == pageSize) {
            pageSize = -1;
        }
        if (null == totalCount) {
            totalCount = 0;
        }

        if (null == limit) {
            limit = -1;
        }

        PaginateWithQueryColumns paginate = query4Paginate(sql, pageNo, pageSize, totalCount, limit, excludeColumns);
        return paginate;
    }

    /**
     * 获取当前数据源表结构
     *
     * @return
     * @throws SourceException
     */
    public List<String> getTableList() throws SourceException {
        List<String> tableList = null;
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
                    tableList = new ArrayList<>();
                    while (tables.next()) {
                        String tableName = tables.getString("TABLE_NAME");
                        if (!StringUtils.isEmpty(tableName)) {
                            tableList.add(tableName);
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
        return tableList;
    }

    /**
     * 获取指定表列信息
     *
     * @param tableName
     * @return
     * @throws SourceException
     */
    public List<TableInfo> getTableColumns(String tableName) throws SourceException {
        List<TableInfo> tableInfoList = null;
        Connection connection = null;
        try {
            connection = getConnection();
            if (null != connection) {
                tableInfoList = new ArrayList<>();
                DatabaseMetaData metaData = connection.getMetaData();
                List<String> primaryKeys = getPrimaryKeys(tableName, metaData);
                List<QueryColumn> columns = getColumns(tableName, metaData);
                TableInfo tableInfo = new TableInfo(tableName, primaryKeys, columns);
                tableInfoList.add(tableInfo);
            }
        } catch (SQLException e) {
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
    public static void checkSensitiveSql(String sql) throws ServerException {
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
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.setFetchSize(1000);
        return jdbcTemplate;
    }

    public void executeBatch(String sql, Set<QueryColumn> headers, List<Map<String, Object>> datas) throws ServerException {

        if (StringUtils.isEmpty(sql)) {
            log.info("execute batch sql is EMPTY");
            throw new ServerException("execute batch sql is EMPTY");
        }

        if (CollectionUtils.isEmpty(datas)) {
            log.info("execute batch data is EMPTY");
            throw new ServerException("execute batch data is EMPTY");
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
                                pstmt.setShort(i, null == obj ? (short) 0 : Short.parseShort(String.valueOf(obj).trim()));
                                break;
                            case "Integer":
                                pstmt.setInt(i, null == obj ? 0 : Integer.parseInt(String.valueOf(obj).trim()));
                                break;
                            case "Long":
                                pstmt.setLong(i, null == obj ? 0L : Long.parseLong(String.valueOf(obj).trim()));
                                break;
                            case "BigDecimal":
                                pstmt.setBigDecimal(i, (BigDecimal) obj);
                                break;
                            case "Float":
                                pstmt.setFloat(i, null == obj ? 0.0F : Float.parseFloat(String.valueOf(obj).trim()));
                                break;
                            case "Double":
                                pstmt.setDouble(i, null == obj ? 0.0D : Double.parseDouble(String.valueOf(obj).trim()));
                                break;
                            case "String":
                                pstmt.setString(i, (String) obj);
                                break;
                            case "Boolean":
                                pstmt.setBoolean(i, null == obj ? false : Boolean.parseBoolean(String.valueOf(obj).trim()));
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
        CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl);
        if (null != customDataSource) {
            keywordPrefix = customDataSource.getKeyword_prefix();
        } else {
            DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
            if (null != dataTypeEnum) {
                keywordPrefix = dataTypeEnum.getKeywordPrefix();
            }
        }
        return StringUtils.isEmpty(keywordPrefix) ? EMPTY : keywordPrefix;
    }

    public static String getKeywordSuffix(String jdbcUrl) {
        String keywordSuffix = "";
        CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl);
        if (null != customDataSource) {
            keywordSuffix = customDataSource.getKeyword_suffix();
        } else {
            DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
            if (null != dataTypeEnum) {
                keywordSuffix = dataTypeEnum.getKeywordSuffix();
            }
        }
        return StringUtils.isEmpty(keywordSuffix) ? EMPTY : keywordSuffix;
    }

    public static String getAliasPrefix(String jdbcUrl) {
        String aliasPrefix = "";
        CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl);
        if (null != customDataSource) {
            aliasPrefix = customDataSource.getAlias_prefix();
        } else {
            DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
            if (null != dataTypeEnum) {
                aliasPrefix = dataTypeEnum.getAliasPrefix();
            }
        }
        return StringUtils.isEmpty(aliasPrefix) ? EMPTY : aliasPrefix;
    }

    public static String getAliasSuffix(String jdbcUrl) {
        String aliasSuffix = "";
        CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl);
        if (null != customDataSource) {
            aliasSuffix = customDataSource.getAlias_suffix();
        } else {
            DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
            if (null != dataTypeEnum) {
                aliasSuffix = dataTypeEnum.getAliasSuffix();
            }
        }
        return StringUtils.isEmpty(aliasSuffix) ? EMPTY : aliasSuffix;
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
        sql = sql.replaceAll(NEW_LINE_CHAR, SPACE).replaceAll("(;+\\s*)+", SEMICOLON);
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

}


class StreamingStatementCreator implements PreparedStatementCreator {
    private final String sql;
    private DataTypeEnum dataTypeEnum;

    public StreamingStatementCreator(String sql, DataTypeEnum dataTypeEnum) {
        this.sql = sql;
        this.dataTypeEnum = dataTypeEnum;
    }

    @Override
    public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
        final PreparedStatement statement = connection.prepareStatement(sql, ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
        statement.setFetchSize(1000);
        return statement;
    }
}
