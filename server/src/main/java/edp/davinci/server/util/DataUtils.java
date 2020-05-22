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

package edp.davinci.server.util;

import static edp.davinci.server.commons.Constants.PATTERN_DB_COLUMN_TYPE;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.stream.Collectors;

import javax.sql.DataSource;

import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.core.dao.entity.User;
import edp.davinci.data.pojo.DataColumn;
import edp.davinci.data.pojo.DataResult;
import edp.davinci.data.pojo.PagingParam;
import edp.davinci.data.pojo.TableType;
import edp.davinci.data.provider.DataProviderFactory;
import edp.davinci.data.provider.JdbcDataProvider;
import edp.davinci.server.enums.DatabaseTypeEnum;
import edp.davinci.server.enums.SqlColumnTypeEnum;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.SourceException;
import edp.davinci.server.model.PagingWithQueryColumns;
import edp.davinci.server.model.QueryColumn;
import edp.davinci.server.model.TableInfo;
import lombok.Getter;

@Component
public class DataUtils {

    // @Getter
    // private DatabaseTypeEnum databaseTypeEnum;

	public static void execute(Source source, String sql, User user) throws ServerException {
		DataProviderFactory.getProvider(source.getType()).execute(source, sql, user);
	}

	public static PagingWithQueryColumns syncQuery4Paging(Source source, String sql, PagingParam paging,
            Set<String> excludeColumns, User user) {
        PagingWithQueryColumns pagingWithQueryColumns = query4Paging(source, sql, paging, excludeColumns, user);
        return pagingWithQueryColumns;
    }

	public static PagingWithQueryColumns query4Paging(Source source, String sql, PagingParam paging,
            Set<String> excludeColumns, User user) {
        DataResult dataResult = DataProviderFactory.getProvider(source.getType()).getData(source, sql, paging, user);
        return toPagingWithQueryColumns(dataResult, paging, excludeColumns);
    }
    
    private static PagingWithQueryColumns toPagingWithQueryColumns(DataResult dataResult, PagingParam paging, Set<String> excludeColumns) {
    	PagingWithQueryColumns pagingWithQueryColumns = new PagingWithQueryColumns();
    	pagingWithQueryColumns.setPageNo(paging.getPageNo());
    	pagingWithQueryColumns.setPageSize(paging.getPageSize());
    	pagingWithQueryColumns.setTotalCount(dataResult.getCount());
    	List<QueryColumn> columns = new ArrayList<QueryColumn>();
    	pagingWithQueryColumns.setColumns(columns);
    	List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
    	pagingWithQueryColumns.setResultList(resultList);
    	
    	List<List<Object>> datas = dataResult.getData();
    	List<DataColumn> headers = dataResult.getHeader();
    	for (int j = 0; j<datas.size(); j++) {

    		List<Object> row = datas.get(j);

    		Map<String, Object> rowMap = new HashMap<>();
    		for (int i = 0; i<headers.size(); i++) {
				DataColumn header = headers.get(i);
				String headerName = header.getName();
				if (excludeColumns.contains(headerName)) {
					continue;
				}
				
				if (j == 0) {
					columns.add(new QueryColumn(headerName, header.getType()));
				}
				rowMap.put(headerName, row.get(i));
			}
    		
    		resultList.add(rowMap);
		}
    	
    	return pagingWithQueryColumns;
    }
    
    public static List<String> getDatabase(Source source, User user) throws SourceException { 
        return DataProviderFactory.getProvider(source.getType()).getDatabases(source, user);
	}

	public static List<QueryColumn> getTableList(Source source, String dbName, User user) throws SourceException {
		List<TableType> tables = DataProviderFactory.getProvider(source.getType()).getTables(source, dbName, user);
		List<QueryColumn> tableList = tables.stream().map( t -> {
			return new QueryColumn(t.getName(), t.getType());
		}).collect(Collectors.toList());
		return tableList;
	}

    public static TableInfo getTableInfo(Source source, String dbName, String tableName, User user) throws SourceException {
		TableInfo tableInfo = new TableInfo();
		tableInfo.setTableName(tableName);
		tableInfo.setPrimaryKeys(new ArrayList<>());
		
		List<DataColumn> headers = DataProviderFactory.getProvider(source.getType()).getColumns(source, dbName, tableName, user);
		List<QueryColumn> list = headers.stream().map(h -> {
			QueryColumn column = new QueryColumn(h.getName(), h.getType());
			return column;
		}).collect(Collectors.toList());
		tableInfo.setColumns(list);
		
		return tableInfo;
    }


    /**
     * 判断表是否存在
     *
     * @param tableName
     * @return
     * @throws SourceException
     */
    public static boolean tableIsExist(Source source, String tableName) throws SourceException {
        JdbcDataProvider provider = (JdbcDataProvider) DataProviderFactory.getProvider(source.getType());
        DataSource dataSource = provider.getDataSource(source);
        try (Connection con = dataSource.getConnection();
                ResultSet res = con.getMetaData().getTables(null, null, tableName, null);) {
            if (res.next()) {
                return true;
            }
        } catch (SQLException e) {
            throw new SourceException(e.getMessage());
        }
        return false;
    }

    public static void batchUpdate(Source source, String preparedSql, List<QueryColumn> headers, List<Map<String, Object>> datas) {
        JdbcDataProvider provider = (JdbcDataProvider)DataProviderFactory.getProvider("jdbc");
        DataSource dataSource = provider.getDataSource(source);
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.batchUpdate(preparedSql, new BatchPreparedStatementSetter(){
        
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                Map<String, Object> row = datas.get(i);
                for (int j = 0; j < headers.size(); j++) {
                    ps.setObject(j + 1, row.get(headers.get(j).getName()));
                }
            }
        
            @Override
            public int getBatchSize() {
                return datas.size();
            }
        });
    }

    public static String formatSqlType(String type) throws ServerException {
        if (!StringUtils.isEmpty(type.trim())) {
            type = type.trim().toUpperCase();
            Matcher matcher = PATTERN_DB_COLUMN_TYPE.matcher(type);
            if (!matcher.find()) {
                return SqlColumnTypeEnum.getType(type);
            } else {
                return type;
            }
        }
        return null;
    }
}

