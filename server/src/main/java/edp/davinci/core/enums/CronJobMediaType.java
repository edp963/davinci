package edp.davinci.core.enums;

public enum CronJobMediaType {
    IMAGE("image"),
    EXCEL("excel"),
    IMAGEANDEXCEL("imageAndExcel");

    private String type;

    public String getType() {
        return type;
    }

    CronJobMediaType(String type) {
        this.type = type;
    }
    }
