package edp.davinci.core.enums;

public enum  CronJobStatusEnum {

    NEW("new"),
    START("started"),
    STOP("stoped"),
    FAILED("failed");

    private String status;

    public String getStatus() {
        return status;
    }

    CronJobStatusEnum(String status) {
        this.status = status;
    }
}
