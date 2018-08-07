package edp.core.enums;

import edp.core.exception.SourceException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public enum DataTypeEnum {

    MYSQL("mysql", "mysql", "com.mysql.jdbc.Driver"),

    ORACLE("oracle", "oracle", "oracle.jdbc.driver.OracleDriver"),

    SQLSERVER("sqlserver", "sqlserver", "com.microsoft.sqlserver.jdbc.SQLServerDriver"),

    H2("h2", "h2", "org.h2.Driver"),

    PHOENIX("phoenix", "hbase phoenix", "org.apache.phoenix.jdbc.PhoenixDriver"),

    MONGODB("mongodb", "mongodb", "mongodb.jdbc.MongoDriver"),

    ELASTICSEARCH("sql4es", "elasticSearch", "nl.anchormen.sql4es.jdbc.ESDriver"),

    PRESTO("presto", "presto", "com.facebook.presto.jdbc.PrestoDriver"),

    MOONBOX("moonbox", "moonbox", "moonbox.jdbc.MbDriver"),

    CASSANDRA("cassandra", "cassandra", "com.github.adejanovski.cassandra.jdbc.CassandraDriver"),

    CLICKHOUSE("clickhouse", "clickhouse", "ru.yandex.clickhouse.ClickHouseDriver"),

    KYLIN("kylin", "kylin", "org.apache.kylin.jdbc.Driver");


    private String feature;
    private String desc;
    private String driver;

    DataTypeEnum(String feature, String desc, String driver) {
        this.feature = feature;
        this.desc = desc;
        this.driver = driver;
    }

    public static DataTypeEnum urlOf(String jdbcUrl) throws SourceException {
        String url = jdbcUrl.toLowerCase();
        for (DataTypeEnum dataTypeEnum : values()) {
            if (url.toLowerCase().indexOf(dataTypeEnum.feature) > -1) {
                try {
                    Class<?> aClass = Class.forName(dataTypeEnum.getDriver());
                    if (null == aClass) {
                        throw new SourceException("Unable to get driver instance for jdbcUrl: " + jdbcUrl);
                    }
                } catch (ClassNotFoundException e) {
                    throw new SourceException("Unable to get driver instance: " + jdbcUrl);
                }
                return dataTypeEnum;
            }
        }
        return null;
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
}
