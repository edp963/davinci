package edp.davinci.core.enums;

public enum CheckEntityEnum {
    USER("user", "userService", "edp.davinci.model.User"),
    TEAM("team", "teamService", "edp.davinci.model.Team"),
    PROJECT("project", "projectService", "edp.davinci.model.Project"),
    ORGANIZATION("organization", "organizationService", "edp.davinci.model.Organization"),
    SOURCE("source", "sourceService", "edp.davinci.model.Source"),
    VIEW("view", "viewService", "edp.davinci.model.View"),
    WIDGET("widget", "widgetService", "edp.davinci.model.Widget"),
    DISPLAY("display", "displayService", "edp.davinci.model.Display"),
    DASHBOARD("dashboard", "dashboardService", "edp.davinci.model.Dashboard"),
    DASHBOARDPORTAL("dashboardPortal", "dashboardPortalService", "edp.davinci.model.DashboardPortal"),
    CRONJOB("cronJob", "cronJobService", "edp.davinci.model.CronJob");

    private String source;
    private String service;
    private String clazz;


    CheckEntityEnum(String source, String service, String clazz) {
        this.source = source;
        this.service = service;
        this.clazz = clazz;
    }

    public static CheckEntityEnum sourceOf(String source) {
        for (CheckEntityEnum sourceEnum : values()) {
            if (sourceEnum.source.equals(source)) {
                return sourceEnum;
            }
        }
        return null;
    }

    public String getService() {
        return service;
    }

    public String getClazz() {
        return clazz;
    }

    public String getSource() {
        return source;
    }
}
