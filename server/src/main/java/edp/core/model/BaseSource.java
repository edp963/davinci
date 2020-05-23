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

package edp.core.model;

import java.util.List;

import edp.davinci.model.Source;

public abstract class BaseSource extends RecordInfo<Source> {

	public abstract String getJdbcUrl();

	public abstract String getUsername();

	public abstract String getPassword();

	public abstract String getDatabase();

	public abstract String getDbVersion();

	public abstract List<Dict> getProperties();

	public abstract boolean isExt();

}
