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

package edp.davinci.data.util;

import com.alibaba.druid.sql.SQLUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.data.enums.DatabaseTypeEnum;
import edp.davinci.data.pojo.CustomDatabase;

import static edp.davinci.commons.Constants.EMPTY;
import static edp.davinci.data.commons.Constants.JDBC_COUNT_SQL_FORMATTER;

public class SqlUtils {

    public static String formatSql(String sql) {
        try {
            return SQLUtils.formatMySql(sql);
        } catch (Exception e) {
            // ignore
        }
        return sql;
    }
    
    public static String getCountSql(String sql) {
    	return String.format(JDBC_COUNT_SQL_FORMATTER, sql);
    }

    public static String getKeywordPrefix(String jdbcUrl, String dbVersion) {
        String keywordPrefix = "";
        CustomDatabase customDatabase = CustomDatabaseUtils.getInstance(jdbcUrl, dbVersion);
        if (null != customDatabase) {
            keywordPrefix = customDatabase.getKeywordPrefix();
        } else {
            DatabaseTypeEnum dataTypeEnum = DatabaseTypeEnum.urlOf(jdbcUrl);
            if (null != dataTypeEnum) {
                keywordPrefix = dataTypeEnum.getKeywordPrefix();
            }
        }
        return StringUtils.isEmpty(keywordPrefix) ? EMPTY : keywordPrefix;
    }

    public static String getKeywordSuffix(String jdbcUrl, String dbVersion) {
        String keywordSuffix = "";
        CustomDatabase customDatabase = CustomDatabaseUtils.getInstance(jdbcUrl, dbVersion);
        if (null != customDatabase) {
            keywordSuffix = customDatabase.getKeywordSuffix();
        } else {
            DatabaseTypeEnum dataTypeEnum = DatabaseTypeEnum.urlOf(jdbcUrl);
            if (null != dataTypeEnum) {
                keywordSuffix = dataTypeEnum.getKeywordSuffix();
            }
        }
        return StringUtils.isEmpty(keywordSuffix) ? EMPTY : keywordSuffix;
    }

    public static String getAliasPrefix(String jdbcUrl, String dbVersion) {
        String aliasPrefix = "";
        CustomDatabase customDatabase = CustomDatabaseUtils.getInstance(jdbcUrl, dbVersion);
        if (null != customDatabase) {
            aliasPrefix = customDatabase.getAliasPrefix();
        } else {
            DatabaseTypeEnum dataTypeEnum = DatabaseTypeEnum.urlOf(jdbcUrl);
            if (null != dataTypeEnum) {
                aliasPrefix = dataTypeEnum.getAliasPrefix();
            }
        }
        return StringUtils.isEmpty(aliasPrefix) ? EMPTY : aliasPrefix;
    }

    public static String getAliasSuffix(String jdbcUrl, String dbVersion) {
        String aliasSuffix = "";
        CustomDatabase customDatabase = CustomDatabaseUtils.getInstance(jdbcUrl, dbVersion);
        if (null != customDatabase) {
            aliasSuffix = customDatabase.getAliasSuffix();
        } else {
            DatabaseTypeEnum dataTypeEnum = DatabaseTypeEnum.urlOf(jdbcUrl);
            if (null != dataTypeEnum) {
                aliasSuffix = dataTypeEnum.getAliasSuffix();
            }
        }
        return StringUtils.isEmpty(aliasSuffix) ? EMPTY : aliasSuffix;
    }
}
