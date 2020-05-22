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

package edp.davinci.data.provider;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import javax.annotation.Resource;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.google.common.base.Stopwatch;

import edp.davinci.commons.util.MD5Utils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.core.dao.entity.User;
import edp.davinci.data.enums.DatabaseTypeEnum;
import edp.davinci.data.exception.SourceException;
import edp.davinci.data.pojo.DataColumn;
import edp.davinci.data.pojo.DataResult;
import edp.davinci.data.pojo.PagingParam;
import edp.davinci.data.pojo.SourceConfig;
import edp.davinci.data.pojo.TableType;
import edp.davinci.data.source.JdbcDataSource;
import edp.davinci.data.util.JdbcSourceUtils;
import edp.davinci.data.util.SqlUtils;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JdbcDataProvider extends DataProvider {

	private static final Logger sqlLogger = LoggerFactory.getLogger("BUSINESS_SQL");

	@Value("${source.result-limit:1000000}")
	private int resultLimit;

	@Value("${source.enable-query-log:false}")
	private boolean logEnable;

	@Autowired
	JdbcDataSource jdbcDataSource;

	public static final String type = "jdbc";
	
	private static final String[] TABLE_TYPES = new String[]{"TABLE", "VIEW"};

	public DataSource getDataSource(Source source) {
		SourceConfig config = JdbcSourceUtils.getSourceConfig(source);
		return jdbcDataSource.getDataSource(config);
	}

	@Override
	public boolean test(Source source, User user) {
		SourceConfig config = JdbcSourceUtils.getSourceConfig(source);
		DataSource dataSource = jdbcDataSource.getDataSource(config);
		try (Connection connection = dataSource.getConnection();) {
			if (connection == null) {
				return false;
			}
		} catch (Exception e) {
			log.error("Get connection fail, url:{}, e:{}", config.getUrl(), e.getMessage());
			return false;
		} finally {
			jdbcDataSource.releaseDatasource(config);
		}
		return true;
	}

	@Override
	public void execute(Source source, String sql, User user) {
		try {
			SourceConfig config = JdbcSourceUtils.getSourceConfig(source);
			DataSource dataSource = jdbcDataSource.getDataSource(config);

			Stopwatch stopwatch = Stopwatch.createStarted();
			getJdbcTemplate(dataSource).execute(sql);
			if (logEnable) {
				String md5 = MD5Utils.getMD5(sql, true, 16);
				sqlLogger.info("User({}) execute sql takes {} ms, sql:{}, md5:{}", user.getId(),
						stopwatch.elapsed(TimeUnit.MILLISECONDS), SqlUtils.formatSql(sql), md5);
			}

		} catch (Exception e) {
			throw new SourceException(e.getMessage());
		}
	}

	@Override
	public DataResult getData(Source source, String sql, PagingParam paging, User user) {
		
		DataResult dataResult = null;
		
		try {
			SourceConfig config = JdbcSourceUtils.getSourceConfig(source);
			DataSource dataSource = jdbcDataSource.getDataSource(config);

			Stopwatch stopwatch = Stopwatch.createStarted();
			JdbcTemplate jdbcTemplate = getJdbcTemplate(dataSource);

			int maxRows = paging.getLimit();
			if (maxRows > resultLimit || maxRows <= 0) {
				maxRows = resultLimit;
			}
			jdbcTemplate.setMaxRows(maxRows);
			DatabaseTypeEnum database = DatabaseTypeEnum.featureOf(config.getDatabase());
			if (database == DatabaseTypeEnum.MYSQL) {
				jdbcTemplate.setFetchSize(Integer.MIN_VALUE);
			}
			
			int pageNo = paging.getPageNo();
			int pageSize = paging.getPageSize();
			int startRow = (pageNo - 1) * pageSize;
			
			// query by paging
			if (pageNo >= 1 && pageSize >= 1) {
				int count = getCount(jdbcTemplate, SqlUtils.getCountSql(sql));
				count = count < maxRows ? count : maxRows;

				// special for mysql paging query you can extend other databases
				switch(database) {
					case MYSQL:
						sql = sql + " limit " + startRow + ", " + pageSize;
						dataResult = getData(jdbcTemplate, sql);
						break;
				default:
					dataResult = getData(jdbcTemplate, sql, startRow);
					break;
				}
				
				dataResult.setCount(count);

			}else {
				dataResult = getData(jdbcTemplate, sql);
				dataResult.setCount(dataResult.getData().size());
			}

			if (logEnable) {
				String md5 = MD5Utils.getMD5(sql, true, 16);
				sqlLogger.info("User({}) execute sql takes {} ms, sql:{}, md5:{}", user.getId(),
						stopwatch.elapsed(TimeUnit.MILLISECONDS), SqlUtils.formatSql(sql), md5);
			}

		} catch (Exception e) {
			throw new SourceException(e.getMessage());
		}

		return dataResult;
	}
	
	private int getCount(JdbcTemplate jdbcTemplate, String sql) {
		try {
			return jdbcTemplate.query(sql, rs -> {
				if (rs.next()) {
					Object value = rs.getObject(1);
					return Integer.parseInt(String.valueOf(value));
				}
				return resultLimit;
			});
		} catch (Exception e) {
			// ignore
		}
		return resultLimit;
	}
	
	private DataResult getData(JdbcTemplate jdbcTemplate, String sql) {
		return jdbcTemplate.query(sql, rs -> {
			
			DataResult dr = new DataResult();
			List<DataColumn> headerList = getHeader(rs);
			dr.setHeader(headerList);
			
			List<List<Object>> dataList = new ArrayList<>();
			while(rs.next()) {
				dataList.add(getRow(headerList, rs));
			}

			dr.setData(dataList);
			dr.setCount(dataList.size());
			return dr;
		});
	}
	
	private DataResult getData(JdbcTemplate jdbcTemplate, String sql, int startRow) {
		return jdbcTemplate.query(sql, rs -> {
			
			DataResult dr = new DataResult();
			List<DataColumn> headerList = getHeader(rs);
			dr.setHeader(headerList);
			
			List<List<Object>> dataList = new ArrayList<>();
			
			// is database jdbc support absolute
			boolean absolute = false;
			try {
				if (startRow > 0) {
					absolute = rs.absolute(startRow);
				}
			} catch (Exception e) {
				// ignore
			}
			
			if (absolute) {
				while (rs.next()) {
					dataList.add(getRow(headerList, rs));
				}
			}else {
				int currentRow = 0; 
				while (rs.next()) {
					if (currentRow >= startRow) {
						dataList.add(getRow(headerList, rs));
					}
					currentRow ++;
				}
			}
			
			dr.setData(dataList);
			return dr;
		});
	}
	
	private JdbcTemplate getJdbcTemplate(DataSource dataSource) {
		JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
		jdbcTemplate.setFetchSize(10);
		return jdbcTemplate;
	}
	
	private List<DataColumn> getHeader(ResultSet rs)  throws SQLException {
		ResultSetMetaData metaData = rs.getMetaData();
		List<DataColumn> headerList = new ArrayList<>();
		for (int i = 1; i <= metaData.getColumnCount(); i++) {
			String label = metaData.getColumnLabel(i);
			String type = metaData.getColumnTypeName(i);
			headerList.add(new DataColumn(label, StringUtils.isNull(type) ? "varchar" : type));
		}
		return headerList;
	}
	
	private List<Object> getRow(List<DataColumn> headerList, ResultSet rs) throws SQLException {
		List<Object> row = new ArrayList<>();
		for (DataColumn header : headerList) {
			Object value = rs.getObject(header.getName());
			row.add(value);
		}
		return row;
	}

	@Override
	public String getProviderType() {
		return type;
	}

	@Override
	public List<TableType> getTables(Source source, String database, User user) {
		SourceConfig config = JdbcSourceUtils.getSourceConfig(source);
		DataSource dataSource = jdbcDataSource.getDataSource(config);
		ResultSet res = null;
		List<TableType> tables = new ArrayList<TableType>();
		try (Connection con = dataSource.getConnection();) {
			DatabaseMetaData metaData = con.getMetaData();
			String schema = metaData.getConnection().getSchema();
			res = con.getMetaData().getTables(database, getSchemaPattern(config, schema), "%", TABLE_TYPES);
			while (res.next()) {
				String name = res.getString("TABLE_NAME");
				String type = res.getString("TABLE_TYPE");
				tables.add(new TableType(name, type));
			}
		} catch (SQLException e) {
			throw new SourceException(e.getMessage());
		}
		return tables;
	}
	
	private String getSchemaPattern(SourceConfig config, String schema) {
		
		DatabaseTypeEnum database = DatabaseTypeEnum.featureOf(config.getDatabase());
		
		if (database == null) {
			return null;
		}

		String schemaPattern = null;
		switch (database) {
		case ORACLE:
			schemaPattern = config.getUsername();
			if (null != schemaPattern) {
				schemaPattern = schemaPattern.toUpperCase();
			}
			break;
		case SQLSERVER:
			schemaPattern = "dbo";
			break;
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

	@Override
	public List<DataColumn> getColumns(Source source, String database, String table, User user) {
		SourceConfig config = JdbcSourceUtils.getSourceConfig(source);
		DataSource dataSource = jdbcDataSource.getDataSource(config);
		ResultSet res = null;
		List<DataColumn> headers = new ArrayList<DataColumn>();
		try (Connection con = dataSource.getConnection();) {

			if (DatabaseTypeEnum.featureOf(config.getDatabase()) == DatabaseTypeEnum.ORACLE) {
            	database = null;
            }
			
			res = con.getMetaData().getColumns(database, null, table, "%");
			while (res.next()) {
				String name = res.getString("COLUMN_NAME");
				String type = res.getString("TYPE_NAME");
				headers.add(new DataColumn(name, type));
			}
		
		} catch (SQLException e) {
			throw new SourceException(e.getMessage());
		}finally {
			JdbcSourceUtils.closeResult(res);
		}

		return headers;
	}

	@Override
	public List<String> getDatabases(Source source, User user) {
		SourceConfig config = JdbcSourceUtils.getSourceConfig(source);

		List<String> databases = new ArrayList<String>();
		
		DatabaseTypeEnum type = DatabaseTypeEnum.featureOf(config.getDatabase());
		if (type == DatabaseTypeEnum.ORACLE) {
			databases.add(config.getUsername());
			return databases;
        }
		
		if (type == DatabaseTypeEnum.ELASTICSEARCH) {
			if (StringUtils.isEmpty(config.getUsername())) {
				databases.add(type.getFeature());
			} else {
				databases.add(config.getUsername());
			}
			return databases;
		}
		
		DataSource dataSource = jdbcDataSource.getDataSource(config);
		ResultSet res = null;
		try (Connection con = dataSource.getConnection();) {
			String catalog = con.getCatalog();
			if (!StringUtils.isEmpty(catalog)) {
				databases.add(catalog);
			} else {
				DatabaseMetaData metaData = con.getMetaData();
				res = metaData.getCatalogs();
				while (res.next()) {
					databases.add(res.getString(1));
				}
			}
		
		} catch (SQLException e) {
			throw new SourceException(e.getMessage());
		}finally {
			JdbcSourceUtils.closeResult(res);
		}

		return databases;
	} 

}
