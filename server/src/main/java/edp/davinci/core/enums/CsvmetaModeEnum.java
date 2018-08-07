package edp.davinci.core.enums;

public enum  CsvmetaModeEnum {

    NEW((short) 0),
    REPLACE((short) 1),
    APPEND((short) 2),

    ;

    private short mode;

    CsvmetaModeEnum(short mode) {
        this.mode = mode;
    }

    public short getMode() {
        return mode;
    }
}
