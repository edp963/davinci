package edp.davinci.core.enums;

public enum  SourceTypeEnum {

    JDBC("jdbc"),
    CSV("csv");

    private String type;

    SourceTypeEnum(String type) {
        this.type = type;
    }

    public static String typeOf(String type) {
        for (SourceTypeEnum sourceTypeEnum : values()) {
            if (sourceTypeEnum.type.equals(type)) {
                return sourceTypeEnum.type;
            }
        }
        return null;
    }
}
