package edp.davinci.data.enums;

public enum NumericType {

    BIT("BIT"),
    TINYINT("TINYINT"),
    SMALLINT("SMALLINT"),
    MEDIUMINT("MEDIUMINT"),
    INT("INT"),
    INTEGER("INTEGER"),
    BIGINT("BIGINT"),
    FLOAT("FLOAT"),
    DOUBLE("DOUBLE"),
    DOUBLEPRECISION("DOUBLE PRECISION"),
    REAL("REAL"),
    SERIAL("SERIAL"),
    BOOL("BOOL"),
    BOOLEAN("BOOLEAN"),
    DEC("DEC"),
    FIXED("FIXED"),
    NUMBER("NUMBER"),
    NUMERIC("NUMERIC"),
    UINT8("UINT8"),
    UINT16("UINT16"),
    UINT32("UINT32"),
    UINT64("UINT64"),
    INT8("INT8"),
    INT16("INT16"),
    INT32("INT32"),
    INT64("INT64"),
    FLOAT32("FLOAT32"),
    FLOAT64("FLOAT64"),
    DECIMAL32("DECIMAL32"),
    DECIMAL64("DECIMAL64"),
    DECIMAL128("DECIMAL128"),
    LONG("LONG");

    private String type;

    NumericType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}