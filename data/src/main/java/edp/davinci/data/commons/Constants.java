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

package edp.davinci.data.commons;

import java.io.File;
import java.util.regex.Pattern;

public class Constants {

	public static final String DATABASE_DEFAULT_VERSION = "Default";

	public static final String EXT_LIB_PATH_FORMATER = "lib" + File.separator + "ext" + File.separator + "%s"
			+ File.separator + "%s" + File.separator;

	public static final String JDBC_URL_PREFIX_FORMATER = "jdbc:%s:";

	public static final String JDBC_COUNT_SQL_FORMATER = "SELECT COUNT(*) FROM (%s) CT";

	public static final String JDBC_SELECT_SQL_FORMATER = "SELECT * FROM TABLE WHERE %s";

	public static final String ORACLE_JDBC_URL_PREFIX = "jdbc:oracle:thin:";

	public static final Pattern JDBC_URL_PATTERN = Pattern.compile("jdbc:\\w+");

	public static final String NO_AUTH_PERMISSION = "@DAVINCI_DATA_ACCESS_DENIED@";

	public static final String SQL_TEMPLATE = "templates/sql/sqlTemplate.stg";

	public static final String REG_SENSITIVE_SQL = "drop\\s|alter\\s|grant\\s|insert\\s|replace\\s|delete\\s|truncate\\s|update\\s|remove\\s";
    public static final Pattern PATTERN_SENSITIVE_SQL = Pattern.compile(REG_SENSITIVE_SQL);
}
