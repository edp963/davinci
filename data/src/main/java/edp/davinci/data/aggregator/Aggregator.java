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

import java.util.List;

import edp.davinci.data.aggregator.JdbcAggregator.DataTable;
import edp.davinci.data.pojo.ColumnModel;

public abstract class Aggregator {

	public abstract String getAggregatorType();
	
	public abstract boolean loadData(String table, List<ColumnModel> header, List<List<Object>> data, long ttl);

	public abstract void cleanData();

	public abstract DataTable getDataTable(String table);
}
