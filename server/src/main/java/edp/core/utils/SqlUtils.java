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
import edp.core.model.BaseSource;
import edp.core.model.QueryColumn;
import edp.core.model.TableInfo;
import edp.davinci.core.enums.SqlColumnEnum;
import lombok.extern.slf4j.Slf4j;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Scope;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@Scope("prototype")
public class SqlUtils {

    @Autowired
    private JdbcDataSource jdbcDataSource;

    private String jdbcUrl;

    private String username;

    private String password;

    public SqlUtils init(BaseSource source) {
        SqlUtils sqlUtils = new SqlUtils();
        sqlUtils.jdbcDataSource = jdbcDataSource;
        sqlUtils.jdbcUrl = source.getJdbcUrl();
        sqlUtils.username = source.getUsername();
        sqlUtils.password = source.getPassword();
        return sqlUtils;
    }

    public SqlUtils init(String jdbcUrl, String username, String password) {
        SqlUtils sqlUtils = new SqlUtils();
        sqlUtils.jdbcDataSource = jdbcDataSource;
        sqlUtils.jdbcUrl = jdbcUrl;
        sqlUtils.username = username;
        sqlUtils.password = password;
        return sqlUtils;
    }

    public void execute(String sql) throws ServerException {
        sql = filterAnnotate(sql);
        checkSensitiveSql(sql);
        try {
            jdbcTemplate().execute(sql);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }
    }

    @CachePut(value = "query", key = "#sql")
    public List<Map<String, Object>> query4List(String sql) throws ServerException {
        sql = filterAnnotate(sql);
        checkSensitiveSql(sql);
        List<Map<String, Object>> list = null;
        try {
            list = jdbcTemplate().queryForList(sql);
            log.info("query by database");
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }
        return list;
    }


    @Cacheable(value = "query", key = "#sql", sync = true)
    public List<Map<String, Object>> syncQuery4List(String sql) throws ServerException {
        List<Map<String, Object>> list = query4List(sql);
        return list;
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
                ResultSet tables = metaData.getTables(null, null, "%", null);
                if (null != tables) {
                    tableInfoList = new ArrayList<>();
                    while (tables.next()) {
                        String tableName = tables.getString("TABLE_NAME");
                        if (!StringUtils.isEmpty(tableName)) {
                            //查询表主键
                            ResultSet resultSet = metaData.getPrimaryKeys(null, null, tableName);
                            List<String> primaryKeys = new ArrayList<>();
                            while (resultSet.next()) {
                                if (!StringUtils.isEmpty(resultSet.getString("PK_NAME")) && "PRIMARY".equals(resultSet.getString("PK_NAME"))) {
                                    primaryKeys.add(resultSet.getString("COLUMN_NAME"));
                                }
                            }
                            resultSet.close();
                            String sql = "select * from `" + tableName + "`";
                            List<QueryColumn> columns = getColumns(sql);
                            TableInfo tableInfo = new TableInfo(tableName, primaryKeys, columns);
                            tableInfoList.add(tableInfo);
                        }
                    }
                }
                tables.close();
            }
        } catch (Exception e) {
            throw new SourceException("Get connection meta data error, jdbcUrl=" + this.jdbcUrl);
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
        checkSensitiveSql(sql);
        Connection connection = null;
        List<QueryColumn> columnList = new ArrayList<>();
        try {
            connection = getConnection();
            if (null != connection) {
                Statement statement = connection.createStatement();
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
            return ESDataSource.getDataSource(jdbcUrl, userename);
        } else {
            return jdbcDataSource.getDataSource(jdbcUrl, userename, password);
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
        } catch (SQLException e) {
            log.error("create connection error, jdbcUrl: {}", jdbcUrl);
            throw new SourceException("create connection error, jdbcUrl: " + this.jdbcUrl);
        }
        return connection;
    }

    private void releaseConnection(Connection connection) {
        if (null != connection) {
            try {
                connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
                log.error("connection close error", e.getMessage());
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


    /**
     * 过滤sql中的注释
     *
     * @param sql
     * @return
     */
    public static String filterAnnotate(String sql) {
        log.info("befor filter annotate sql >>: {}", sql);
        Pattern p = Pattern.compile(Consts.REG_SQL_ANNOTATE);
        sql = p.matcher(sql).replaceAll("$1");
        log.info("after filter annotate sql >>: {}", sql);
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
            }
        }
        return null;
    }

}
