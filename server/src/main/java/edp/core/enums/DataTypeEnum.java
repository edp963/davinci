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

package edp.core.enums;

import edp.core.consts.Consts;
import edp.core.exception.SourceException;

import java.util.EnumSet;
import java.util.Set;

public enum DataTypeEnum {

    MYSQL("mysql", "mysql", "com.mysql.cj.jdbc.Driver", "`", "`", "'", "'"),

    HIVE2("hive2", "hive", "org.apache.hive.jdbc.HiveDriver", "`", "`", "`", "`"),

    ORACLE("oracle", "oracle", "oracle.jdbc.driver.OracleDriver", "\"", "\"", "\"", "\""),

    SQLSERVER("sqlserver", "sqlserver", "com.microsoft.sqlserver.jdbc.SQLServerDriver", "\"", "\"", "\"", "\""),

    H2("h2", "h2", "org.h2.Driver", "`", "`", "\"", "\""),

    PHOENIX("phoenix", "hbase phoenix", "org.apache.phoenix.jdbc.PhoenixDriver", "", "", "\"", "\""),

    MONGODB("mongo", "mongodb", "mongodb.jdbc.MongoDriver", "`", "`", "\"", "\""),

    ELASTICSEARCH("elasticsearch", "elasticsearch", "com.amazon.opendistroforelasticsearch.jdbc.Driver", "", "", "'", "'"),

    PRESTO("presto", "presto", "com.facebook.presto.jdbc.PrestoDriver", "\"", "\"", "\"", "\""),

    MOONBOX("moonbox", "moonbox", "moonbox.jdbc.MbDriver", "`", "`", "`", "`"),

    CASSANDRA("cassandra", "cassandra", "com.github.adejanovski.cassandra.jdbc.CassandraDriver", "", "", "'", "'"),

    CLICKHOUSE("clickhouse", "clickhouse", "ru.yandex.clickhouse.ClickHouseDriver", "", "", "\"", "\""),

    KYLIN("kylin", "kylin", "org.apache.kylin.jdbc.Driver", "\"", "\"", "\"", "\""),

    VERTICA("vertica", "vertica", "com.vertica.jdbc.Driver", "", "", "'", "'"),

    HANA("sap", "sap hana", "com.sap.db.jdbc.Driver", "", "", "'", "'"),

    IMPALA("impala", "impala", "com.cloudera.impala.jdbc41.Driver", "", "", "'", "'"),

    TDENGINE("TAOS", "TAOS", "com.taosdata.jdbc.TSDBDriver", "'", "'", "\"", "\""),

    ODPS("odps", "odps", "com.aliyun.odps.jdbc.OdpsDriver", "", "", "`", "`");

    private String feature;
    private String desc;
    private String driver;
    private String keywordPrefix;
    private String keywordSuffix;
    private String aliasPrefix;
    private String aliasSuffix;

    DataTypeEnum(String feature, String desc, String driver, String keywordPrefix, String keywordSuffix, String aliasPrefix, String aliasSuffix) {
        this.feature = feature;
        this.desc = desc;
        this.driver = driver;
        this.keywordPrefix = keywordPrefix;
        this.keywordSuffix = keywordSuffix;
        this.aliasPrefix = aliasPrefix;
        this.aliasSuffix = aliasSuffix;
    }

    private static Set<DataTypeEnum> mysqlTypeDBs = EnumSet.of(MOONBOX, MONGODB, ELASTICSEARCH,
            CASSANDRA, VERTICA, KYLIN, HANA, IMPALA, TDENGINE, ODPS);

    public static DataTypeEnum urlOf(String jdbcUrl) throws SourceException {
        String url = jdbcUrl.toLowerCase().trim();
        for (DataTypeEnum dataTypeEnum : values()) {
            if (url.startsWith(String.format(Consts.JDBC_PREFIX_FORMATTER, dataTypeEnum.feature))) {
                return dataTypeEnum;
            }
        }
        return null;
    }

    public static boolean hasMysqlFeature(String jdbcUrl) throws SourceException {
        DataTypeEnum dataTypeEnum = urlOf(jdbcUrl);
        if (dataTypeEnum != null && mysqlTypeDBs.contains(dataTypeEnum)) {
            return true;
        }
        return false;
    }

    public String getFeature() {
        return feature;
    }

    public String getDesc() {
        return desc;
    }

    public String getDriver() {
        return driver;
    }

    public String getKeywordPrefix() {
        return keywordPrefix;
    }

    public String getKeywordSuffix() {
        return keywordSuffix;
    }

    public String getAliasPrefix() {
        return aliasPrefix;
    }

    public String getAliasSuffix() {
        return aliasSuffix;
    }
}
