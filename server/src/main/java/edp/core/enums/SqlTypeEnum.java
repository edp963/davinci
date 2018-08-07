package edp.core.enums;

import edp.core.exception.ServerException;

public enum SqlTypeEnum {

    TINYINT("TINYINT", "TINYINT(2)"),
    SMALLINT("SMALLINT", "SMALLINT(3)"),
    INT("INT", "INT(12)"),
    INTEGER("INTEGER", "INTEGER(12)"),
    BIGINT("BIGINT", "BIGINT(20)"),
    DECIMAL("DECIMAL", "DECIMAL(17,3)"),
    NUMERIC("NUMERIC", "NUMERIC(17,3)"),
    REAL("REAL", "REAL"),
    FLOAT("FLOAT", "FLOAT"),
    DOUBLE("DOUBLE", "DOUBLE"),
    CHAR("CHAR", "CHAR(1)"),
    VARCHAR("VARCHAR", "VARCHAR(255)"),
    NVARCHAR("NVARCHAR", "NVARCHAR(1000)"),
    LONGVARCHAR("LONGVARCHAR", "LONGVARCHAR(2000)"),
    LONGNVARCHAR("LONGNVARCHAR", "LONGNVARCHAR(2000)"),
    TEXT("TEXT", "TEXT"),
    BOOLEAN("BOOLEAN", "BIT(1)"),
    BIT("BIT", "BIT(8)"),
    BINARY("BINARY", "BINARY(128)"),
    VARBINARY("VARBINARY", "VARBINARY(128)"),
    LONGVARBINARY("LONGVARBINARY", "LONGVARBINARY(128)"),
    DATE("DATE", "DATE"),
    DATETIME("DATETIME", "DATETIME"),
    TIMESTAMP("TIMESTAMP", "TIMESTAMP"),
    BLOB("BLOB", "BLOB"),
    CLOB("CLOB", "CLOB");

    private String name;
    private String type;

    SqlTypeEnum(String name, String type) {
        this.name = name;
        this.type = type;
    }

    public static String getType(String name) throws ServerException {
        name = name.toUpperCase();
        for (SqlTypeEnum sqlTypeEnum : values()) {
            if (sqlTypeEnum.name.equals(name)) {
                return sqlTypeEnum.type;
            }
        }
        throw new ServerException("Unknown Type: " + name);
    }
}
