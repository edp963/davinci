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

package edp.core.utils;

import com.alibaba.druid.util.StringUtils;
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
import net.sf.jsqlparser.expression.Alias;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.schema.Table;
import net.sf.jsqlparser.statement.select.*;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Scope;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.util.*;
import java.util.regex.Matcher;

import static edp.core.consts.Consts.*;
import static edp.core.enums.DataTypeEnum.MYSQL;
import static edp.core.enums.DataTypeEnum.ORACLE;

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


    private String jdbcUrl;

    private String username;

    private String password;

    private String database;

    private String dbVersion;

    private boolean isExt;

    private DataTypeEnum dataTypeEnum;

    private SourceUtils sourceUtils;

    public SqlUtils init(BaseSource source) {
        return SqlUtilsBuilder
                .SqlUtils()
                .withJdbcUrl(source.getJdbcUrl())
                .withUsername(source.getUsername())
                .withPassword(source.getPassword())
                .withDbVersion(source.getDbVersion())
                .withIsExt(source.isExt())
                .withJdbcDataSource(this.jdbcDataSource)
                .withResultLimit(this.resultLimit)
                .withIsQueryLogEnable(this.isQueryLogEnable)
                .build();
    }

    public SqlUtils init(String jdbcUrl, String username, String password, String dbVersion, boolean ext) {
        return SqlUtilsBuilder
                .SqlUtils()
                .withJdbcUrl(jdbcUrl)
                .withUsername(username)
                .withPassword(password)
                .withDbVersion(dbVersion)
                .withIsExt(ext)
                .withJdbcDataSource(this.jdbcDataSource)
                .withResultLimit(this.resultLimit)
                .withIsQueryLogEnable(this.isQueryLogEnable)
                .build();
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

    @Cacheable(value = "query", keyGenerator = "keyGenerator", sync = true)
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
            getResultForPaginate(sql, paginateWithQueryColumns, jdbcTemplate, excludeColumns, -1);
            paginateWithQueryColumns.setPageNo(1);
            int size = paginateWithQueryColumns.getResultList().size();
            paginateWithQueryColumns.setPageSize(size);
            paginateWithQueryColumns.setTotalCount(size);
        } else {
            paginateWithQueryColumns.setPageNo(pageNo);
            paginateWithQueryColumns.setPageSize(pageSize);

            final int startRow = (pageNo - 1) * pageSize;

            if (pageNo == 1 || totalCount == 0) {
                Object o = jdbcTemplate.queryForObject(getCountSql(sql), Object.class);
                totalCount = Integer.parseInt(String.valueOf(o));
            }
            if (limit > 0) {
                limit = limit > resultLimit ? resultLimit : limit;
                totalCount = limit < totalCount ? limit : totalCount;
            }

            paginateWithQueryColumns.setTotalCount(totalCount);
            int maxRows = limit > 0 && limit < pageSize * pageNo ? limit : pageSize * pageNo;

            if (this.dataTypeEnum == MYSQL) {
                sql = sql + " LIMIT " + startRow + ", " + pageSize;
                md5 = MD5Util.getMD5(sql, true, 16);
                if (isQueryLogEnable) {
                    sqlLogger.info("{}  >> \n{}", md5, sql);
                }
                getResultForPaginate(sql, paginateWithQueryColumns, jdbcTemplate, excludeColumns, -1);
            } else {
                if (isQueryLogEnable) {
                    sqlLogger.info("{}  >> \n{}", md5, sql);
                }
                jdbcTemplate.setMaxRows(maxRows);
                getResultForPaginate(sql, paginateWithQueryColumns, jdbcTemplate, excludeColumns, startRow);
            }
        }

        if (isQueryLogEnable) {
            sqlLogger.info("{} query for >> {} ms", md5, System.currentTimeMillis() - befor);
        }

        return paginateWithQueryColumns;
    }

    private void getResultForPaginate(String sql, PaginateWithQueryColumns paginateWithQueryColumns, JdbcTemplate jdbcTemplate, Set<String> excludeColumns, int startRow) {
        Set<String> queryFromsAndJoins = getQueryFromsAndJoins(sql);
        jdbcTemplate.query(sql, rs -> {
            if (null != rs) {
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
            }
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
            map.put(label, rs.getObject(key));
        }
        return map;
    }

    public static String getCountSql(String sql) {
        try {
            Select select = (Select) CCJSqlParserUtil.parse(sql);
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            plainSelect.setOrderByElements(null);
            return String.format(QUERY_COUNT_SQL, select.toString());
        } catch (JSQLParserException e) {
        }
        return String.format(Consts.QUERY_COUNT_SQL, sql);
    }


    public static Set<String> getQueryFromsAndJoins(String sql) {
        Set<String> columnPrefixs = new HashSet<>();
        try {
            Select select = (Select) CCJSqlParserUtil.parse(sql);
            SelectBody selectBody = select.getSelectBody();
            if (selectBody instanceof PlainSelect) {
                PlainSelect plainSelect = (PlainSelect) selectBody;
                columnPrefixExtractor(columnPrefixs, plainSelect);
            } else if (selectBody instanceof SetOperationList) {
                SetOperationList setOperationList = (SetOperationList) selectBody;
                List<SelectBody> selects = setOperationList.getSelects();
                for (SelectBody optSelectBody : selects) {
                    PlainSelect plainSelect = (PlainSelect) optSelectBody;
                    columnPrefixExtractor(columnPrefixs, plainSelect);
                }
            } else if (selectBody instanceof WithItem) {
                WithItem withItem = (WithItem) selectBody;
                PlainSelect plainSelect = (PlainSelect) withItem.getSelectBody();
                columnPrefixExtractor(columnPrefixs, plainSelect);
            }
        } catch (JSQLParserException e) {
        }
        return columnPrefixs;
    }

    private static void columnPrefixExtractor(Set<String> columnPrefixs, PlainSelect plainSelect) {
        getFromItemName(columnPrefixs, plainSelect.getFromItem());
        List<Join> joins = plainSelect.getJoins();
        if (!CollectionUtils.isEmpty(joins)) {
            joins.forEach(join -> getFromItemName(columnPrefixs, join.getRightItem()));
        }
    }

    private static void getFromItemName(Set<String> columnPrefixs, FromItem fromItem) {
        Alias alias = fromItem.getAlias();
        if (alias != null) {
            if (alias.isUseAs()) {
                columnPrefixs.add(alias.getName().trim() + DOT);
            } else {
                columnPrefixs.add(alias.toString().trim() + DOT);
            }
        } else {
            fromItem.accept(getFromItemTableName(columnPrefixs));
        }
    }


    public static String getColumnLabel(Set<String> columnPrefixs, String columnLable) {
        if (!CollectionUtils.isEmpty(columnPrefixs)) {
            for (String prefix : columnPrefixs) {
                if (columnLable.startsWith(prefix)) {
                    return columnLable.replaceFirst(prefix, EMPTY);
                } else if (columnLable.startsWith(prefix.toLowerCase())) {
                    return columnLable.replaceFirst(prefix.toLowerCase(), EMPTY);
                } else if (columnLable.startsWith(prefix.toUpperCase())) {
                    return columnLable.replaceFirst(prefix.toUpperCase(), EMPTY);
                }
            }
        }
        return columnLable;
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
            connection = sourceUtils.getConnection(this.jdbcUrl, this.username, this.password, this.database, this.dbVersion, this.isExt);
            if (null != connection) {
                if (this.dataTypeEnum == ORACLE) {
                    dbList.add(this.username);
                } else {
                    String catalog = connection.getCatalog();
                    if (!StringUtils.isEmpty(catalog)) {
                        dbList.add(catalog);
                    } else {
                        DatabaseMetaData metaData = connection.getMetaData();
                        ResultSet rs = metaData.getCatalogs();
                        while (rs.next()) {
                            dbList.add(rs.getString(1));
                        }
                    }
                }

            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new SourceException(e.getMessage() + ", jdbcUrl=" + this.jdbcUrl);
        } finally {
            sourceUtils.releaseConnection(connection);
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
        try {
            connection = sourceUtils.getConnection(this.jdbcUrl, this.username, this.password, this.database, this.dbVersion, this.isExt);
            if (null != connection) {
                DatabaseMetaData metaData = connection.getMetaData();
                String schema = null;
                try {
                    schema = metaData.getConnection().getSchema();
                } catch (Throwable t) {
                }

                ResultSet tables = metaData.getTables(dbName, getDBSchemaPattern(schema), "%", TABLE_TYPES);
                if (null != tables) {
                    tableList = new ArrayList<>();
                    while (tables.next()) {
                        String name = tables.getString(TABLE_NAME);
                        if (!StringUtils.isEmpty(name)) {
                            String type = TABLE;
                            try {
                                type = tables.getString(TABLE_TYPE);
                            } catch (Exception e) {
                            }
                            tableList.add(new QueryColumn(name, type));
                        }
                    }
                }
                tables.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new SourceException(e.getMessage() + ", jdbcUrl=" + this.jdbcUrl);
        } finally {
            sourceUtils.releaseConnection(connection);
        }
        return tableList;
    }

    private String getDBSchemaPattern(String schema) {
        String schemaPattern = null;
        DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(this.jdbcUrl);
        if (null != dataTypeEnum) {
            switch (dataTypeEnum) {
                case ORACLE:
                    schemaPattern = this.username;
                    if (null != schemaPattern) {
                        schemaPattern = schemaPattern.toUpperCase();
                    }
                    break;
                case SQLSERVER:
                    schemaPattern = "dbo";

                case PRESTO:
                    if (!StringUtils.isEmpty(schema)) {
                        schemaPattern = schema;
                    }
                    break;
            }
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
            connection = sourceUtils.getConnection(this.jdbcUrl, this.username, this.password, this.database, this.dbVersion, this.isExt);
            if (null != connection) {
                DatabaseMetaData metaData = connection.getMetaData();
                List<String> primaryKeys = getPrimaryKeys(dbName, tableName, metaData);
                List<QueryColumn> columns = getColumns(dbName, tableName, metaData);
                tableInfo = new TableInfo(tableName, primaryKeys, columns);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new SourceException(e.getMessage() + ", jdbcUrl=" + this.jdbcUrl);
        } finally {
            sourceUtils.releaseConnection(connection);
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
        try {
            connection = sourceUtils.getConnection(this.jdbcUrl, this.username, this.password, this.database, this.dbVersion, this.isExt);
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
            sourceUtils.releaseConnection(connection);
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
            connection = sourceUtils.getConnection(this.jdbcUrl, this.username, this.password, this.database, this.dbVersion, this.isExt);
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
            sourceUtils.releaseConnection(connection);
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
    private List<String> getPrimaryKeys(String dbName, String tableName, DatabaseMetaData metaData) throws ServerException {
        ResultSet rs = null;
        List<String> primaryKeys = new ArrayList<>();
        try {
            rs = metaData.getPrimaryKeys(dbName, null, tableName);
            while (rs.next()) {
                primaryKeys.add(rs.getString(4));
            }
        } catch (Exception e) {
            log.error(e.getMessage());
        } finally {
            sourceUtils.closeResult(rs);
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
            while (rs.next()) {
                columnList.add(new QueryColumn(rs.getString(4), rs.getString(6)));
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        } finally {
            sourceUtils.closeResult(rs);
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
        Matcher matcher = PATTERN_SENSITIVE_SQL.matcher(sql.toLowerCase());
        if (matcher.find()) {
            String group = matcher.group();
            log.warn("Sensitive SQL operations are not allowed: {}", group.toUpperCase());
            throw new ServerException("Sensitive SQL operations are not allowed: " + group.toUpperCase());
        }
    }


    public JdbcTemplate jdbcTemplate() throws SourceException {
        DataSource dataSource = sourceUtils.getDataSource(this.jdbcUrl, this.username, this.password, this.database, this.dbVersion, this.isExt);
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.setFetchSize(1000);
        return jdbcTemplate;
    }

    public boolean testConnection() throws SourceException {
        Connection connection = null;
        try {
            connection = sourceUtils.getConnection(this.jdbcUrl, this.username, this.password, this.database, this.dbVersion, this.isExt);
            if (null != connection) {
                return true;
            } else {
                return false;
            }
        } catch (SourceException sourceException) {
            throw sourceException;
        } finally {
            sourceUtils.releaseConnection(connection);
        }
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
            connection = sourceUtils.getConnection(this.jdbcUrl, this.username, this.password, this.database, this.dbVersion, this.isExt);
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
                                pstmt.setBoolean(i, null == obj ? false : Boolean.parseBoolean(String.valueOf(obj).trim()));
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
                                    DateTime dateTime = (DateTime) obj;
                                    pstmt.setTimestamp(i, DateUtils.toTimestamp(dateTime));
                                }
                                break;
                            case "Timestamp":
                                pstmt.setTimestamp(i, null == obj ? null : (Timestamp) obj);
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
            sourceUtils.releaseConnection(connection);
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


    /**
     * 过滤sql中的注释
     *
     * @param sql
     * @return
     */
    public static String filterAnnotate(String sql) {
        sql = PATTERN_SQL_ANNOTATE.matcher(sql).replaceAll("$1");
        sql = sql.replaceAll(NEW_LINE_CHAR, SPACE).replaceAll("(;+\\s*)+", SEMICOLON);
        return sql;
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

    public SqlUtils(String jdbcUrl, String username, String password, String dbVersion, boolean isExt) {
        this.jdbcUrl = jdbcUrl;
        this.username = username;
        this.password = password;
        this.dbVersion = dbVersion;
        this.isExt = isExt;
    }

    public static final class SqlUtilsBuilder {
        private JdbcDataSource jdbcDataSource;
        private int resultLimit;
        private boolean isQueryLogEnable;
        private String jdbcUrl;
        private String username;
        private String password;
        private String dbVersion;
        private boolean isExt;

        private SqlUtilsBuilder() {
        }

        public static SqlUtilsBuilder SqlUtils() {
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

            SqlUtils sqlUtils = new SqlUtils(jdbcUrl, username, password, dbVersion, isExt);
            sqlUtils.jdbcDataSource = this.jdbcDataSource;
            sqlUtils.resultLimit = this.resultLimit;
            sqlUtils.isQueryLogEnable = this.isQueryLogEnable;
            sqlUtils.dataTypeEnum = DataTypeEnum.urlOf(jdbcUrl);
            sqlUtils.database = datasource;
            sqlUtils.sourceUtils = new SourceUtils(this.jdbcDataSource);

            return sqlUtils;
        }
    }

    public String getJdbcUrl() {
        return jdbcUrl;
    }
}

