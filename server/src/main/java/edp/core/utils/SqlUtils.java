/*
 * <<
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

package edp.core.utils;

import com.alibaba.druid.sql.SQLUtils;
import com.alibaba.druid.util.StringUtils;
import edp.core.common.jdbc.JdbcDataSource;
import edp.core.consts.Consts;
import edp.core.enums.DataTypeEnum;
import edp.core.enums.SqlTypeEnum;
import edp.core.exception.ServerException;
import edp.core.exception.SourceException;
import edp.core.model.*;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.SqlColumnEnum;
import edp.davinci.core.utils.SourcePasswordEncryptUtils;
import edp.davinci.core.utils.SqlParseUtils;
import edp.davinci.model.Source;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Alias;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.schema.Table;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.select.*;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;

import static edp.core.consts.Consts.*;
import static edp.core.enums.DataTypeEnum.*;

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

    private static final String TABLE = "TABLE";

    private static final String VIEW = "VIEW";

    private static final String[] TABLE_TYPES = new String[]{TABLE, VIEW};

    private static final String TABLE_NAME = "TABLE_NAME";

    private static final String TABLE_TYPE = "TABLE_TYPE";

    private JdbcSourceInfo jdbcSourceInfo;

    @Getter
    private DataTypeEnum dataTypeEnum;

    private SourceUtils sourceUtils;

    private static String sqlTempDelimiter;

    @Value("${sql-template-delimiter:$}")
    public void setSqlTempDelimiter(String delimiter) {
        this.sqlTempDelimiter = delimiter;
    }

    public SqlUtils init(Source source) {
        // Password decryption
        String decrypt = SourcePasswordEncryptUtils.decrypt(source.getPassword());
        return SqlUtilsBuilder
                .getBuilder()
                .withName(source.getId() + AT_SYMBOL + source.getName())
                .withType(source.getType())
                .withJdbcUrl(source.getJdbcUrl())
                .withUsername(source.getUsername())
                .withPassword(decrypt)
                .withDbVersion(source.getDbVersion())
                .withProperties(source.getProperties())
                .withIsExt(source.isExt())
                .withJdbcDataSource(this.jdbcDataSource)
                .withResultLimit(this.resultLimit)
                .withIsQueryLogEnable(this.isQueryLogEnable)
                .build();
    }

    public SqlUtils init(String name, String type, String jdbcUrl, String username, String password, String dbVersion, List<Dict> properties, boolean ext) {
        // Password decryption
        String decrypt = SourcePasswordEncryptUtils.decrypt(password);
        return SqlUtilsBuilder
                .getBuilder()
                .withName(name)
                .withType(type)
                .withJdbcUrl(jdbcUrl)
                .withUsername(username)
                .withPassword(decrypt)
                .withDbVersion(dbVersion)
                .withProperties(properties)
                .withIsExt(ext)
                .withJdbcDataSource(this.jdbcDataSource)
                .withResultLimit(this.resultLimit)
                .withIsQueryLogEnable(this.isQueryLogEnable)
                .build();
    }

    public void execute(String sql) throws ServerException {
        if (isQueryLogEnable) {
            String md5 = MD5Util.getMD5(sql, true, 16);
            sqlLogger.info("{} execute for sql:{}", md5, formatSql(sql));
        }
        try {
            jdbcTemplate().execute(sql);
        } catch (Exception e) {
            log.error(e.toString(), e);
            throw new ServerException(e.getMessage());
        }
    }

    public PaginateWithQueryColumns syncQuery4Paginate(String sql, Integer pageNo, Integer pageSize, Integer totalCount, Integer limit, Set<String> excludeColumns) throws Exception {
        if (null == pageNo || pageNo < 1) {
            pageNo = 0;
        }
        if (null == pageSize || pageSize < 1) {
            pageSize = 0;
        }
        if (null == totalCount || totalCount < 1) {
            totalCount = 0;
        }
        if (null == limit) {
            limit = -1;
        }
        PaginateWithQueryColumns paginate = query4Paginate(sql, pageNo, pageSize, totalCount, limit, excludeColumns);
        return paginate;
    }

    public List<Map<String, Object>> query4List(String sql, int limit) {
        JdbcTemplate jdbcTemplate = jdbcTemplate();
        jdbcTemplate.setMaxRows(limit > resultLimit ? resultLimit : limit > 0 ? limit : resultLimit);

        long before = System.currentTimeMillis();

        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql);

        if (isQueryLogEnable) {
            String md5 = MD5Util.getMD5(sql, true, 16);
            sqlLogger.info("{} query for {} ms, total count:{} sql:{}", md5, System.currentTimeMillis() - before, list.size(), formatSql(sql));
        }

        return list;
    }

    public PaginateWithQueryColumns query4Paginate(String sql, int pageNo, int pageSize, int totalCount, int limit, Set<String> excludeColumns) {

        PaginateWithQueryColumns paginateWithQueryColumns = new PaginateWithQueryColumns();

        long before = System.currentTimeMillis();

        JdbcTemplate jdbcTemplate = jdbcTemplate();
        jdbcTemplate.setMaxRows(resultLimit);
        if (pageNo < 1 && pageSize < 1) {

            if (limit > 0) {
                jdbcTemplate.setMaxRows(Math.min(limit, resultLimit));
            }

            // special for mysql
            if (getDataTypeEnum() == DataTypeEnum.MYSQL) {
                jdbcTemplate.setFetchSize(Integer.MIN_VALUE);
            }

            getResultForPaginate(sql, paginateWithQueryColumns, jdbcTemplate, excludeColumns, -1);
            paginateWithQueryColumns.setPageNo(1);
            int size = paginateWithQueryColumns.getResultList().size();
            paginateWithQueryColumns.setPageSize(size);
            paginateWithQueryColumns.setTotalCount(size);

        } else {
            paginateWithQueryColumns.setPageNo(pageNo);
            paginateWithQueryColumns.setPageSize(pageSize);

            int startRow = (pageNo - 1) * pageSize;

            if (pageNo == 1 || totalCount == 0) {
                Object o = jdbcTemplate.queryForList(getCountSql(sql), Object.class).get(0);
                totalCount = Integer.parseInt(String.valueOf(o));
            }

            if (limit > 0) {
                totalCount = Math.min(Math.min(limit, resultLimit), totalCount);
                if (limit < pageNo * pageSize) {
                    jdbcTemplate.setMaxRows(limit - startRow);
                } else {
                    jdbcTemplate.setMaxRows(Math.min(limit, pageSize));
                }
            } else {
                jdbcTemplate.setMaxRows(pageNo * pageSize);
            }

            paginateWithQueryColumns.setTotalCount(totalCount);

            if (this.dataTypeEnum == MYSQL) {
                sql = sql + " LIMIT " + startRow + ", " + pageSize;
                getResultForPaginate(sql, paginateWithQueryColumns, jdbcTemplate, excludeColumns, -1);
            } else if (this.dataTypeEnum == KYLIN) {
                sql = sql + " LIMIT " + pageSize + " OFFSET "+ (pageNo - 1) * pageSize;
                getResultForPaginate(sql, paginateWithQueryColumns, jdbcTemplate, excludeColumns, -1);
            }
            else {
                getResultForPaginate(sql, paginateWithQueryColumns, jdbcTemplate, excludeColumns, startRow);
            }
        }

        if (isQueryLogEnable) {
            String md5 = MD5Util.getMD5(sql + pageNo + pageSize + limit, true, 16);
            sqlLogger.info("{} query for {} ms, total count:{}, page size:{}, sql:{}",
                    md5, System.currentTimeMillis() - before,
                    paginateWithQueryColumns.getTotalCount(),
                    paginateWithQueryColumns.getPageSize(),
                    formatSql(sql));
        }

        return paginateWithQueryColumns;
    }

    private void getResultForPaginate(String sql, PaginateWithQueryColumns paginateWithQueryColumns, JdbcTemplate jdbcTemplate, Set<String> excludeColumns, int startRow) {
        Set<String> queryFromsAndJoins = getQueryFromsAndJoins(sql);
        jdbcTemplate.query(sql, rs -> {
            if (null == rs) {
                return paginateWithQueryColumns;
            }

            ResultSetMetaData metaData = rs.getMetaData();
            List<QueryColumn> queryColumns = new ArrayList<>();
            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                String key = getColumnLabel(queryFromsAndJoins, metaData.getColumnLabel(i));
                if (!CollectionUtils.isEmpty(excludeColumns) && excludeColumns.contains(key)) {
                    continue;
                }
                queryColumns.add(new QueryColumn(key, metaData.getColumnTypeName(i)));
            }
            paginateWithQueryColumns.setColumns(queryColumns);

            List<Map<String, Object>> resultList = new ArrayList<>();

            try {
                if (startRow > 0) {
                    rs.absolute(startRow);
                }
                while (rs.next()) {
                    resultList.add(getResultObjectMap(excludeColumns, rs, metaData, queryFromsAndJoins));
                }
            } catch (Throwable e) {
                int currentRow = 0;
                while (rs.next()) {
                    if (currentRow >= startRow) {
                        resultList.add(getResultObjectMap(excludeColumns, rs, metaData, queryFromsAndJoins));
                    }
                    currentRow++;
                }
            }

            paginateWithQueryColumns.setResultList(resultList);

            return paginateWithQueryColumns;
        });
    }

    private Map<String, Object> getResultObjectMap(Set<String> excludeColumns, ResultSet rs, ResultSetMetaData metaData, Set<String> queryFromsAndJoins) throws SQLException {
        Map<String, Object> map = new LinkedHashMap<>();

        for (int i = 1; i <= metaData.getColumnCount(); i++) {
            String key = metaData.getColumnLabel(i);
            String label = getColumnLabel(queryFromsAndJoins, key);

            if (!CollectionUtils.isEmpty(excludeColumns) && excludeColumns.contains(label)) {
                continue;
            }
            Object value = rs.getObject(key);
            map.put(label, value instanceof byte[] ? new String((byte[]) value) : value);
        }
        return map;
    }

    public static String getCountSql(String sql) {
        String countSql = String.format(Consts.QUERY_COUNT_SQL, sql);
        try {
            Select select = (Select) CCJSqlParserUtil.parse(sql);
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            plainSelect.setOrderByElements(null);
            countSql = String.format(QUERY_COUNT_SQL, select.toString());
        } catch (JSQLParserException e) {
            log.debug(e.getMessage(), e);
        }
        return SqlParseUtils.rebuildSqlWithFragment(countSql);
    }

    public static boolean isSelect(String src) {
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

    public static Set<String> getQueryFromsAndJoins(String sql) {
        Set<String> columnPrefixes = new HashSet<>();
        try {
            Statement parse = CCJSqlParserUtil.parse(sql);
            Select select = (Select) parse;
            SelectBody selectBody = select.getSelectBody();
            if (selectBody instanceof PlainSelect) {
                PlainSelect plainSelect = (PlainSelect) selectBody;
                columnPrefixExtractor(columnPrefixes, plainSelect);
            }

            if (selectBody instanceof SetOperationList) {
                SetOperationList setOperationList = (SetOperationList) selectBody;
                List<SelectBody> selects = setOperationList.getSelects();
                for (SelectBody optSelectBody : selects) {
                    PlainSelect plainSelect = (PlainSelect) optSelectBody;
                    columnPrefixExtractor(columnPrefixes, plainSelect);
                }
            }

            if (selectBody instanceof WithItem) {
                WithItem withItem = (WithItem) selectBody;
                PlainSelect plainSelect = (PlainSelect) withItem.getSelectBody();
                columnPrefixExtractor(columnPrefixes, plainSelect);
            }
        } catch (JSQLParserException e) {
            log.debug(e.getMessage(), e);
        }
        return columnPrefixes;
    }

    private static void columnPrefixExtractor(Set<String> columnPrefixes, PlainSelect plainSelect) {
        getFromItemName(columnPrefixes, plainSelect.getFromItem());
        List<Join> joins = plainSelect.getJoins();
        if (!CollectionUtils.isEmpty(joins)) {
            joins.forEach(join -> getFromItemName(columnPrefixes, join.getRightItem()));
        }
    }

    private static void getFromItemName(Set<String> columnPrefixes, FromItem fromItem) {
        if (fromItem == null) {
            return;
        }
        Alias alias = fromItem.getAlias();
        if (alias != null) {
            if (alias.isUseAs()) {
                columnPrefixes.add(alias.getName().trim() + DOT);
            } else {
                columnPrefixes.add(alias.toString().trim() + DOT);
            }
        } else {
            fromItem.accept(getFromItemTableName(columnPrefixes));
        }
    }

    public static String getColumnLabel(Set<String> columnPrefixes, String columnLabel) {
        if (!CollectionUtils.isEmpty(columnPrefixes)) {
            for (String prefix : columnPrefixes) {
                if (columnLabel.startsWith(prefix)) {
                    return columnLabel.replaceFirst(prefix, EMPTY);
                }
                if (columnLabel.startsWith(prefix.toLowerCase())) {
                    return columnLabel.replaceFirst(prefix.toLowerCase(), EMPTY);
                }
                if (columnLabel.startsWith(prefix.toUpperCase())) {
                    return columnLabel.replaceFirst(prefix.toUpperCase(), EMPTY);
                }
            }
        }
        return columnLabel;
    }

    /**
     * 获取当前连接数据库
     *
     * @return
     * @throws SourceException
     */
    public List<String> getDatabases() throws SourceException {
        List<String> dbList = new ArrayList<>();
        Connection connection = null;
        try {
            connection = sourceUtils.getConnection(this.jdbcSourceInfo);
            if (null == connection) {
                return dbList;
            }

            if (dataTypeEnum == ORACLE) {
                dbList.add(this.jdbcSourceInfo.getUsername());
                return dbList;
            }

            if (dataTypeEnum == ELASTICSEARCH) {
                if (StringUtils.isEmpty(this.jdbcSourceInfo.getUsername())) {
                    dbList.add(dataTypeEnum.getFeature());
                } else {
                    dbList.add(this.jdbcSourceInfo.getUsername());
                }
                return dbList;
            }

            String catalog = connection.getCatalog();
            if (!StringUtils.isEmpty(catalog)) {
                dbList.add(catalog);
            } else {
                DatabaseMetaData metaData = connection.getMetaData();
                ResultSet rs = null;
                if (dataTypeEnum == HIVE2)
                    rs = metaData.getSchemas();
                else
                    rs = metaData.getCatalogs();
                if (rs != null) {
                    while (rs.next()) {
                        dbList.add(rs.getString(1));
                    }
                }
            }

        } catch (Exception e) {
            log.error(e.toString(), e);
            return dbList;
        } finally {
            SourceUtils.releaseConnection(connection);
        }
        return dbList;
    }

    /**
     * 获取当前数据源表结构
     *
     * @return
     * @throws SourceException
     */
    public List<QueryColumn> getTableList(String dbName) throws SourceException {

        List<QueryColumn> tableList = null;
        Connection connection = null;
        ResultSet tables = null;

        try {
            connection = sourceUtils.getConnection(this.jdbcSourceInfo);
            if (null == connection) {
                return null;
            }

            DatabaseMetaData metaData = connection.getMetaData();
            String schema = null;
            try {
                if (dataTypeEnum == HIVE2)
                    schema = dbName;
                else
                    schema = metaData.getConnection().getSchema();
            } catch (Throwable t) {
                // ignore
            }

            tables = metaData.getTables(dbName, getDBSchemaPattern(schema), "%", TABLE_TYPES);
            if (null == tables) {
                return null;
            }

            tableList = new ArrayList<>();
            while (tables.next()) {
                String name = tables.getString(TABLE_NAME);
                if (!StringUtils.isEmpty(name)) {
                    String type = TABLE;
                    try {
                        type = tables.getString(TABLE_TYPE);
                    } catch (Exception e) {
                        // ignore
                    }
                    tableList.add(new QueryColumn(name, type));
                }
            }
        } catch (Exception e) {
            log.error(e.toString(), e);
            return tableList;
        } finally {
            SourceUtils.closeResult(tables);
            SourceUtils.releaseConnection(connection);
        }
        return tableList;
    }

    private String getDBSchemaPattern(String schema) {
        if (dataTypeEnum == null) {
            return null;
        }
        String schemaPattern = null;
        switch (dataTypeEnum) {
            case ORACLE:
                schemaPattern = this.jdbcSourceInfo.getUsername();
                if (null != schemaPattern) {
                    schemaPattern = schemaPattern.toUpperCase();
                }
                break;
            case SQLSERVER:
                schemaPattern = "dbo";
                break;
            case CLICKHOUSE:
            case HIVE2:
            case PRESTO:
                if (!StringUtils.isEmpty(schema)) {
                    schemaPattern = schema;
                }
                break;
            default:
                break;
        }
        return schemaPattern;
    }

    /**
     * 获取指定表列信息
     *
     * @param tableName
     * @return
     * @throws SourceException
     */
    public TableInfo getTableInfo(String dbName, String tableName) throws SourceException {
        TableInfo tableInfo = null;
        Connection connection = null;
        try {
            connection = sourceUtils.getConnection(this.jdbcSourceInfo);
            if (null != connection) {
                DatabaseMetaData metaData = connection.getMetaData();
                List<String> primaryKeys = getPrimaryKeys(dbName, tableName, metaData);
                List<QueryColumn> columns = getColumns(dbName, tableName, metaData);
                tableInfo = new TableInfo(tableName, primaryKeys, columns);
            }
        } catch (SQLException e) {
            log.error(e.toString(), e);
            throw new SourceException(e.getMessage() + ", jdbcUrl=" + this.jdbcSourceInfo.getJdbcUrl());
        } finally {
            SourceUtils.releaseConnection(connection);
        }
        return tableInfo;
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
        ResultSet rs = null;
        try {
            connection = sourceUtils.getConnection(this.jdbcSourceInfo);
            if (null != connection) {
                rs = connection.getMetaData().getTables(null, null, tableName, null);
                if (null != rs && rs.next()) {
                    result = true;
                } else {
                    result = false;
                }
            }
        } catch (Exception e) {
            log.error(e.toString(), e);
            throw new SourceException("Get connection meta data error, jdbcUrl=" + this.jdbcSourceInfo.getJdbcUrl());
        } finally {
            SourceUtils.closeResult(rs);
            SourceUtils.releaseConnection(connection);
        }
        return result;
    }


    /**
     * 获取数据表主键
     *
     * @param tableName
     * @param metaData
     * @return
     * @throws ServerException
     */
    private List<String> getPrimaryKeys(String dbName, String tableName, DatabaseMetaData metaData) throws ServerException {
        ResultSet rs = null;
        List<String> primaryKeys = new ArrayList<>();
        try {
            rs = metaData.getPrimaryKeys(dbName, null, tableName);
            if (rs == null) {
                return primaryKeys;
            }
            while (rs.next()) {
                primaryKeys.add(rs.getString("COLUMN_NAME"));
            }
        } catch (Exception e) {
            log.error(e.toString(), e);
        } finally {
            SourceUtils.closeResult(rs);
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
    private List<QueryColumn> getColumns(String dbName, String tableName, DatabaseMetaData metaData) throws ServerException {
        ResultSet rs = null;
        List<QueryColumn> columnList = new ArrayList<>();
        try {
            if (this.dataTypeEnum == ORACLE) {
                dbName = null;
            }
            rs = metaData.getColumns(dbName, null, tableName, "%");
            if (rs == null) {
                return columnList;
            }
            while (rs.next()) {
                columnList.add(new QueryColumn(rs.getString("COLUMN_NAME"), rs.getString("TYPE_NAME")));
            }
        } catch (Exception e) {
            log.error(e.toString(), e);
        } finally {
            SourceUtils.closeResult(rs);
        }
        return columnList;
    }


    /**
     * 检查敏感操作
     *
     * @param sql
     * @throws ServerException
     */
    public static void checkSensitiveSql(String sql) throws ServerException {
//        Matcher matcher = PATTERN_SENSITIVE_SQL.matcher(sql.toLowerCase());
//        if (matcher.find()) {
//            String group = matcher.group();
//            log.warn("Sensitive SQL operations are not allowed: {}", group.toUpperCase());
//            throw new ServerException("Sensitive SQL operations are not allowed: " + group.toUpperCase());
//        }
    }

    public JdbcTemplate jdbcTemplate() throws SourceException {
        Connection connection = null;
        try {
            connection = sourceUtils.getConnection(jdbcSourceInfo);
        } finally {
            SourceUtils.releaseConnection(connection);
        }
        DataSource dataSource = sourceUtils.getDataSource(jdbcSourceInfo);
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.setDatabaseProductName(jdbcSourceInfo.getDatabase());
        jdbcTemplate.setFetchSize(500);
        return jdbcTemplate;
    }

    public boolean testConnection() throws SourceException {
        try (Connection connection = sourceUtils.getConnection(jdbcSourceInfo);) {
            if (null != connection) {
                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            throw new SourceException(e.getMessage());
        }
    }

    public void executeBatch(String sql, Set<QueryColumn> headers, List<Map<String, Object>> datas) throws ServerException {

        if (StringUtils.isEmpty(sql)) {
            log.error("Execute batch sql is empty");
            throw new ServerException("Execute batch sql is empty");
        }

        if (CollectionUtils.isEmpty(datas)) {
            log.error("Execute batch data is empty");
            throw new ServerException("Execute batch data is empty");
        }

        Connection connection = null;
        PreparedStatement pstmt = null;
        try {
            connection = sourceUtils.getConnection(this.jdbcSourceInfo);
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
                                pstmt.setShort(i, null == obj || String.valueOf(obj).equals(EMPTY) ? (short) 0 : Short.parseShort(String.valueOf(obj).trim()));
                                break;
                            case "Integer":
                                pstmt.setInt(i, null == obj || String.valueOf(obj).equals(EMPTY) ? 0 : Integer.parseInt(String.valueOf(obj).trim()));
                                break;
                            case "Long":
                                pstmt.setLong(i, null == obj || String.valueOf(obj).equals(EMPTY) ? 0L : Long.parseLong(String.valueOf(obj).trim()));
                                break;
                            case "BigDecimal":
                                pstmt.setBigDecimal(i, null == obj || String.valueOf(obj).equals(EMPTY) ? null : (BigDecimal) obj);
                                break;
                            case "Float":
                                pstmt.setFloat(i, null == obj || String.valueOf(obj).equals(EMPTY) ? 0.0F : Float.parseFloat(String.valueOf(obj).trim()));
                                break;
                            case "Double":
                                pstmt.setDouble(i, null == obj || String.valueOf(obj).equals(EMPTY) ? 0.0D : Double.parseDouble(String.valueOf(obj).trim()));
                                break;
                            case "String":
                                pstmt.setString(i, (String) obj);
                                break;
                            case "Boolean":
                                pstmt.setBoolean(i, null != obj && Boolean.parseBoolean(String.valueOf(obj).trim()));
                                break;
                            case "Bytes":
                                pstmt.setBytes(i, (byte[]) obj);
                                break;
                            case "Date":
                                if (obj == null) {
                                    pstmt.setDate(i, null);
                                } else {
                                    java.util.Date date = (java.util.Date) obj;
                                    pstmt.setDate(i, DateUtils.toSqlDate(date));
                                }
                                break;
                            case "DateTime":
                                if (obj == null) {
                                    pstmt.setTimestamp(i, null);
                                } else {
                                    if (obj instanceof LocalDateTime) {
                                        pstmt.setTimestamp(i, Timestamp.valueOf((LocalDateTime) obj));
                                    } else {
                                        DateTime dateTime = (DateTime) obj;
                                        pstmt.setTimestamp(i, DateUtils.toTimestamp(dateTime));
                                    }
                                }
                                break;
                            case "Timestamp":
                                if (obj == null) {
                                    pstmt.setTimestamp(i, null);
                                } else {
                                    if (obj instanceof LocalDateTime) {
                                        pstmt.setTimestamp(i, Timestamp.valueOf((LocalDateTime) obj));
                                    } else {
                                        pstmt.setTimestamp(i, (Timestamp) obj);
                                    }
                                }
                                break;
                            case "Blob":
                                pstmt.setBlob(i, null == obj ? null : (Blob) obj);
                                break;
                            case "Clob":
                                pstmt.setClob(i, null == obj ? null : (Clob) obj);
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
            log.error(e.toString(), e);
            if (null != connection) {
                try {
                    connection.rollback();
                } catch (SQLException se) {
                    log.error(se.toString(), se);
                }
            }
            throw new ServerException(e.getMessage(), e);
        } finally {
            if (null != pstmt) {
                try {
                    pstmt.close();
                } catch (SQLException e) {
                    log.error(e.toString(), e);
                    throw new ServerException(e.getMessage(), e);
                }
            }
            SourceUtils.releaseConnection(connection);
        }
    }

    public static String getKeywordPrefix(String jdbcUrl, String dbVersion) {
        String keywordPrefix = "";
        CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl, dbVersion);
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

    public static String getKeywordSuffix(String jdbcUrl, String dbVersion) {
        String keywordSuffix = "";
        CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl, dbVersion);
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

    public static String getAliasPrefix(String jdbcUrl, String dbVersion) {
        String aliasPrefix = "";
        CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl, dbVersion);
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

    public static String getAliasSuffix(String jdbcUrl, String dbVersion) {
        String aliasSuffix = "";
        CustomDataSource customDataSource = CustomDataSourceUtils.getInstance(jdbcUrl, dbVersion);
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

    public static String getSqlTempDelimiter(List<Dict> properties) {

        if (CollectionUtils.isEmpty(properties)) {
            return sqlTempDelimiter;
        }

        Optional<Dict> optional = properties.stream().filter(d -> d.getKey().equalsIgnoreCase("davinci.sql-template" +
                "-delimiter")).findFirst();
        if (optional.isPresent()) {
            return optional.get().getValue();
        }

        return sqlTempDelimiter;
    }

    public static String formatSqlType(String type) throws ServerException {
        if (!StringUtils.isEmpty(type.trim())) {
            type = type.trim().toUpperCase();
            Matcher matcher = PATTERN_DB_COLUMN_TYPE.matcher(type);
            if (!matcher.find()) {
                return SqlTypeEnum.getType(type);
            } else {
                return type;
            }
        }
        return null;
    }

    private static FromItemVisitor getFromItemTableName(Set<String> set) {
        return new FromItemVisitor() {
            @Override
            public void visit(Table tableName) {
                set.add(tableName.getName() + DOT);
            }

            @Override
            public void visit(SubSelect subSelect) {
            }

            @Override
            public void visit(SubJoin subjoin) {
            }

            @Override
            public void visit(LateralSubSelect lateralSubSelect) {
            }

            @Override
            public void visit(ValuesList valuesList) {
            }

            @Override
            public void visit(TableFunction tableFunction) {
            }

            @Override
            public void visit(ParenthesisFromItem aThis) {
            }
        };
    }


    public SqlUtils() {

    }

    public SqlUtils(JdbcSourceInfo jdbcSourceInfo) {
        this.jdbcSourceInfo = jdbcSourceInfo;
        this.dataTypeEnum = DataTypeEnum.urlOf(jdbcSourceInfo.getJdbcUrl());
    }

    public static final class SqlUtilsBuilder {
        private JdbcDataSource jdbcDataSource;
        private int resultLimit;
        private boolean isQueryLogEnable;
        private String name;
        private String type;
        private String jdbcUrl;
        private String username;
        private String password;
        private List<Dict> properties;
        private String dbVersion;
        private boolean isExt;

        private SqlUtilsBuilder() {

        }

        public static SqlUtilsBuilder getBuilder() {
            return new SqlUtilsBuilder();
        }

        SqlUtilsBuilder withJdbcDataSource(JdbcDataSource jdbcDataSource) {
            this.jdbcDataSource = jdbcDataSource;
            return this;
        }

        SqlUtilsBuilder withResultLimit(int resultLimit) {
            this.resultLimit = resultLimit;
            return this;
        }

        SqlUtilsBuilder withIsQueryLogEnable(boolean isQueryLogEnable) {
            this.isQueryLogEnable = isQueryLogEnable;
            return this;
        }

        SqlUtilsBuilder withName(String name) {
            this.name = name;
            return this;
        }

        SqlUtilsBuilder withType(String type) {
            this.type = type;
            return this;
        }

        SqlUtilsBuilder withJdbcUrl(String jdbcUrl) {
            this.jdbcUrl = jdbcUrl;
            return this;
        }

        SqlUtilsBuilder withUsername(String username) {
            this.username = username;
            return this;
        }

        SqlUtilsBuilder withPassword(String password) {
            this.password = password;
            return this;
        }

        SqlUtilsBuilder withProperties(List<Dict> properties) {
            this.properties = properties;
            return this;
        }

        SqlUtilsBuilder withDbVersion(String dbVersion) {
            this.dbVersion = dbVersion;
            return this;
        }

        SqlUtilsBuilder withIsExt(boolean isExt) {
            this.isExt = isExt;
            return this;
        }

        public SqlUtils build() throws ServerException {
            String datasource = SourceUtils.isSupportedDatasource(jdbcUrl);
            SourceUtils.checkDriver(datasource, jdbcUrl, dbVersion, isExt);

            JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfo
                    .JdbcSourceInfoBuilder
                    .aJdbcSourceInfo()
                    .withName(this.name)
                    .withType(this.type)
                    .withJdbcUrl(this.jdbcUrl)
                    .withUsername(this.username)
                    .withPassword(this.password)
                    .withDatabase(datasource)
                    .withDbVersion(this.dbVersion)
                    .withProperties(this.properties)
                    .withExt(this.isExt)
                    .build();

            SqlUtils sqlUtils = new SqlUtils(jdbcSourceInfo);
            sqlUtils.jdbcDataSource = this.jdbcDataSource;
            sqlUtils.resultLimit = this.resultLimit;
            sqlUtils.isQueryLogEnable = this.isQueryLogEnable;
            sqlUtils.sourceUtils = new SourceUtils(this.jdbcDataSource);

            return sqlUtils;
        }
    }

    public String getJdbcUrl() {
        if (this.jdbcSourceInfo == null) {
            return null;
        }
        return this.jdbcSourceInfo.getJdbcUrl();
    }

    public String formatSql(String sql) {
        try {
            switch (dataTypeEnum) {
                case ORACLE:
                    return SQLUtils.formatOracle(sql);
                case MYSQL:
                    return SQLUtils.formatMySql(sql);
                case HIVE2:
                    return SQLUtils.formatHive(sql);
                default:
                    return sql;
            }
        } catch (Exception e) {
            // ignore
        }
        return sql;
    }
}

