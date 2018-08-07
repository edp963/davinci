package edp.core.enums;

public enum TypeEnum {

    BIT(-7, "BIT"),

    TINYINT(-6, "TINYINT"),

    SMALLINT(5, "SMALLINT"),

    INTEGER(4, "INTEGER"),

    BIGINT(-5, "BIGINT"),

    FLOAT(6, "FLOAT"),

    REAL(7, "REAL"),

    DOUBLE(8, "DOUBLE"),

    NUMERIC(2, "NUMERIC"),

    DECIMAL(3, "DECIMAL"),

    CHAR(1, "CHAR"),

    VARCHAR(12, "VARCHAR"),

    LONGVARCHAR(-1, "LONGVARCHAR"),

    DATE(91, "DATE"),

    TIME(92, "TIME"),

    TIMESTAMP(93, "TIMESTAMP"),

    BINARY(-2, "BINARY"),

    VARBINARY(-3, "VARBINARY"),

    LONGVARBINARY(-4, "LONGVARBINARY"),

    NULL(0, "NULL"),

    OTHER(1111, "OTHER"),

    JAVA_OBJECT(2000, "JAVA_OBJECT"),

    DISTINCT(2001, "DISTINCT"),

    STRUCT(2002, "STRUCT"),

    ARRAY(2003, "ARRAY"),

    BLOB(2004, "BLOB"),

    CLOB(2005, "CLOB"),

    REF(2006, "REF"),

    DATALINK(70, "DATALINK"),

    BOOLEAN(16, "BOOLEAN"),

    ROWID(-8, "ROWID"),

    NCHAR(-15, "NCHAR"),

    NVARCHAR(-9, "NVARCHAR"),

    LONGNVARCHAR(-16, "LONGNVARCHAR"),

    NCLOB(2011, "NCLOB"),

    SQLXML(2009, "SQLXML"),

    REF_CURSOR(2012, "REF_CURSOR"),

    TIME_WITH_TIMEZONE(2013, "TIME_WITH_TIMEZONE"),

    TIMESTAMP_WITH_TIMEZONE(2014, "TIMESTAMP_WITH_TIMEZONE");

    private int value;
    private String typeName;

    TypeEnum(int value, String typeName) {
        this.value = value;
        this.typeName = typeName;
    }

    public static String getType(int value) {
        for (TypeEnum typeEnum : values()) {
            if (value == typeEnum.value) {
                return typeEnum.typeName;
            }
        }
        return null;
    }
}
