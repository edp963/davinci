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

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.List;
import java.util.StringJoiner;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.annotation.Resource;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import edp.davinci.data.exception.SourceException;
import edp.davinci.data.pojo.SourceConfig;
import edp.davinci.data.pojo.ColumnModel;
import edp.davinci.data.source.JdbcDataSource;
import edp.davinci.data.util.JdbcSourceUtils;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JdbcAggregator extends Aggregator {
	
	public static List<String> NUMBER_TYPES = Arrays.asList(new String[]{
            "BIT", "TINYINT", "SMALLINT", "MEDIUMINT", "INT", "INTEGER", "BIGINT",
            "FLOAT", "DOUBLE", "DOUBLE PRECISION", "REAL", "DECIMAL",
            "BIT", "SERIAL", "BOOL", "BOOLEAN", "DEC", "FIXED", "NUMBER", "NUMERIC",
            "UINT8", "UINT16", "UINT32", "UINT64", "INT8", "INT16", "INT32", "INT64",
            "FLOAT32", "FLOAT64", "DECIMAL32", "DECIMAL64", "DECIMAL128", "LONG"
            });
	
	@Value("${aggregator.name}")
    private String name;

    @Value("${aggregator.url:jdbc:h2:file:~/h2/data/davinci;DB_CLOSE_DELAY=-1;COMPRESS=true;TRACE_LEVEL_FILE=0;TRACE_LEVEL_SYSTEM_OUT=0}")
    private String url;

    @Value("${aggregator.username}")
    private String username;
    
    @Value("${aggregator.password}")
    private String password;

	@Value("${aggregator.result-limit:300000}")
	private int resultLimit;
	
	@Value("${aggregator.keyword_prefix:`}")
	private String keywordPrefix;

	@Value("${aggregator.keyword_suffix:`}")
	private String keywordSuffix;
	
	@Resource(name = "defaultJdbcDataSource")
	JdbcDataSource jdbcDataSource;
	
	@Override
	public String getAggregatorType() {
		return "jdbc";
	}

	@Override
	public void beforeLoad(String table, List<ColumnModel> header, List<List<Object>> data) {
		DataSource source = getSource();
		try (Connection conn = source.getConnection(); 
				Statement statmt = conn.createStatement();) {
			statmt.execute("drop table if exists " + table);
			statmt.execute(buildCreateSql(table, header));
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
	private String buildCreateSql(String table, List<ColumnModel> header) {
		StringJoiner createJoiner = new StringJoiner(", ", "create table " + table + "(", ");");
		header.stream().map(h -> {
			String name =  h.getName();
			if ("value".equalsIgnoreCase(h.getModelType())) {
				return keywordPrefix + name + keywordSuffix + " decimal";
			}else {
				return "`"+ name +"`" + " varchar(255)";
			}
		}).collect(Collectors.toList()).forEach(createJoiner::add);
        return createJoiner.toString();
	}
	
	@Override
	public boolean loadData(String table, List<ColumnModel> header, List<List<Object>> data) {
		
		if (data.size() > resultLimit) {
			throw new SourceException("The result set is more than " + resultLimit + " rows");
		}
		
		DataSource source = getSource();
		try (Connection conn = source.getConnection();
				PreparedStatement ps = conn.prepareStatement(buildInsertSql(table, header));) {
			for (int i = 0; i < data.size(); i++) {
				for (int j = 0; j < header.size(); j++) {
					ps.setObject(j+1, data.get(i).get(j));
				}
				ps.addBatch();
			}
			ps.executeBatch();
		} catch (Exception e) {
			log.error("Jdbc aggregator table({}) load data error:{}", table, e.getMessage());
			return false;
		}
		return true;
	}
	
	private DataSource getSource() {
		SourceConfig config = SourceConfig.builder()
				.database(JdbcSourceUtils.getDatabase(url))
				.name(name)
				.password(password)
				.url(url)
				.username(username)
				.build();
		DataSource source = jdbcDataSource.getDataSource(config);
		return source;
	}
	
	private String buildInsertSql(String table, List<ColumnModel> header) {
        StringJoiner insertJoiner = new StringJoiner(", ", "insert into " + table + " values (", ");");
        IntStream.range(0, header.size()).forEach(i -> insertJoiner.add("?"));
        return insertJoiner.toString();
	}

	@Override
	public void afterLoad(String table, List<ColumnModel> header, List<List<Object>> data) {
		
	}

}
