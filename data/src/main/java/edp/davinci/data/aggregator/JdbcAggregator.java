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

package edp.davinci.data.aggregator;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.sql.DataSource;

import com.google.common.base.Stopwatch;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCallback;
import org.springframework.stereotype.Component;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.data.exception.SourceException;
import edp.davinci.data.pojo.ColumnModel;
import edp.davinci.data.pojo.SourceConfig;
import edp.davinci.data.source.JdbcDataSource;
import edp.davinci.data.util.JdbcSourceUtils;
import lombok.Data;

@Component
public class JdbcAggregator extends Aggregator {

	@Data
	public class DataTable {
		String tableName;
		int ttl;
		long createTime;

		public boolean isTtl() {
			return this.ttl + this.createTime < System.currentTimeMillis();
		}
	}

	public static final String DATA_TABLE_NAME = "davinci_data_table";

	@Value("${aggregator.name}")
	private String name;

	@Value("${aggregator.url:jdbc:h2:file:~/h2/data/davinci;DB_CLOSE_DELAY=-1;COMPRESS=true;TRACE_LEVEL_FILE=0;TRACE_LEVEL_SYSTEM_OUT=0;AUTO_SERVER=true;DATABASE_TO_UPPER=false}")
	private String url;

	@Value("${aggregator.username}")
	private String username;

	@Value("${aggregator.password}")
	private String password;

	@Value("${aggregator.ttl:30000}")
	private int ttl;

	@Value("${aggregator.result-limit:300000}")
	private int resultLimit;

	@Value("${aggregator.keywordPrefix:\"}")
	private String keywordPrefix;

	@Value("${aggregator.keywordSuffix:\"}")
	private String keywordSuffix;

	@Autowired
	JdbcDataSource jdbcDataSource;

	@Override
	public String getAggregatorType() {
		return "jdbc";
	}

	@Override
	public boolean loadData(String table, List<ColumnModel> header, List<List<Object>> data, long ttl) {

		synchronized (table.intern()) {

			DataTable t = getDataTable(table);
			if (!t.isTtl()) {
				return true;
			}

			if (data.size() > resultLimit) {
				throw new SourceException("The result set is more than " + resultLimit + " rows");
			}

			Stopwatch watch = Stopwatch.createStarted();

			beforeLoad(table, header);

			DataSource source = getDataSource();
			getJdbcTemplate(source).batchUpdate(buildInsertSql(table, header), new BatchPreparedStatementSetter(){
			
				@Override
				public void setValues(PreparedStatement ps, int i) throws SQLException {
					for (int j = 0; j < header.size(); j++) {
						ps.setObject(j + 1, data.get(i).get(j));
					}
				}
			
				@Override
				public int getBatchSize() {
					return data.size();
				}
			});

			afterLoad(table, Math.max(watch.elapsed(TimeUnit.MILLISECONDS) + ttl, this.ttl));
			return true;
		}
	}

	private JdbcTemplate getJdbcTemplate(DataSource dataSource) {
		JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
		return jdbcTemplate;
	}

	private DataSource getDataSource() {
		SourceConfig config = SourceConfig.builder().database(JdbcSourceUtils.getDatabase(url)).name(name)
				.password(password).url(url).username(username).build();
		DataSource source = jdbcDataSource.getDataSource(config);
		return source;
	}

	public Source getSource() {
		SourceConfig config = SourceConfig.builder().database(JdbcSourceUtils.getDatabase(url)).name(name)
				.password(password).url(url).username(username).build();
		Source source = new Source();
		source.setConfig(JSONUtils.toString(config));
		source.setType(getAggregatorType());
		return source;
	}

	private void beforeLoad(String table, List<ColumnModel> header) {
		DataSource source = getDataSource();
		String[] sql = new String[3];
		sql[0] = "drop table if exists " + table + "";
		sql[1] = "delete from " + DATA_TABLE_NAME + " where table_name = '" + table + "'";
		sql[2] = buildCreateSql(table, header);
		getJdbcTemplate(source).batchUpdate(sql);
	}

	private String buildCreateSql(String table, List<ColumnModel> header) {
		StringJoiner createJoiner = new StringJoiner(", ", "create table " + table + "(", ")");
		header.stream().map(h -> {
			String name = h.getName();
			if ("value".equalsIgnoreCase(h.getModelType())) {
				return keywordPrefix + name + keywordSuffix + " decimal";
			} else {
				return keywordPrefix + name + keywordSuffix + " varchar(255)";
			}
		}).collect(Collectors.toList()).forEach(createJoiner::add);
		return createJoiner.toString();
	}

	private String buildInsertSql(String table, List<ColumnModel> header) {
		StringJoiner insertJoiner = new StringJoiner(", ", "insert into " + table + " values (", ");");
		IntStream.range(0, header.size()).forEach(i -> insertJoiner.add("?"));
		return insertJoiner.toString();
	}

	private void afterLoad(String table, long ttl) {
		DataSource source = getDataSource();
		getJdbcTemplate(source).execute("insert into " + DATA_TABLE_NAME + " values(?,?,?)",
				new PreparedStatementCallback<Boolean>() {
					@Override
					public Boolean doInPreparedStatement(PreparedStatement ps)
							throws SQLException, DataAccessException {
						ps.setString(1, table);
						// min ttl is 10s
						ps.setInt(2, Integer.parseInt(Long.toString(ttl)));
						ps.setTimestamp(3, new Timestamp(System.currentTimeMillis()));
						return ps.execute();
					}
				});
	}

	@Override
	public DataTable getDataTable(String table) {

		List<DataTable> tables = new ArrayList<>();
		String sql = "select * from " + DATA_TABLE_NAME + " where table_name = '" + table + "'";
		DataSource source = getDataSource();
		getJdbcTemplate(source).query(sql, (rs) -> {
			DataTable t = new DataTable();
			t.setTableName(rs.getString(1));
			t.setTtl(rs.getInt(2));
			t.setCreateTime(rs.getTimestamp(3).getTime());
			tables.add(t);
		});

		return tables.size() > 0 ? tables.get(0) : new DataTable();
	}

	@Override
	public void cleanData() {

		try {
			
			List<DataTable> tables = new ArrayList<>();

			DataSource source = getDataSource();
			getJdbcTemplate(source).query("select * from " + DATA_TABLE_NAME, (rs) -> {
				DataTable t = new DataTable();
				t.setTableName(rs.getString(1));
				t.setTtl(rs.getInt(2));
				t.setCreateTime(rs.getTimestamp(3).getTime());
				tables.add(t);
			});

			tables.stream().filter(t -> t.isTtl()).forEach(t -> {
				String tableName = t.getTableName();
				synchronized (tableName.intern()) {
					t = getDataTable(tableName);
					if (t.isTtl()) {// double check
						// drop table;
						String[] sql = new String[2];
						sql[0] = "drop table if exists " + tableName;
						sql[1] = "delete from " + DATA_TABLE_NAME + " where table_name = '" + tableName + "'";
						getJdbcTemplate(source).batchUpdate(sql);
					}
				}
			});

		}catch(Exception e) {
			e.printStackTrace();
		}
	}

}