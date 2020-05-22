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

import java.util.List;

import edp.davinci.core.dao.entity.Source;
import edp.davinci.core.dao.entity.User;
import edp.davinci.data.pojo.DataColumn;
import edp.davinci.data.pojo.DataResult;
import edp.davinci.data.pojo.PagingParam;
import edp.davinci.data.pojo.TableType;

public abstract class DataProvider {
	
	public abstract String getProviderType();
	
	public abstract boolean test(Source source, User user);
	
	public abstract List<String> getDatabases(Source source, User user);
	
	public abstract List<TableType> getTables(Source source, String database, User user);
	
	public abstract List<DataColumn> getColumns(Source source, String database, String table, User user);

	public abstract void execute(Source source, String sql, User user);

	public abstract DataResult getData(Source source, String sql, PagingParam paging, User user);

}
