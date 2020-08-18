package edp.davinci.server.enums;


public enum TableTypeEnum {
	USER("user"),
	ROLE("role"),
	ORGANIZATION("organization"),
	VIEW("view"),
	WIDGET("widget"),
	SOURCE("source"),
	PROJECT("project"),
	DASHBOARD("dashboard"),
	DASHBOARD_PORTAL("dashboard_portal"),
	DISPLAY("display"),
	CRON_JOB("cron_job"),
	DISPLAY_SLIDE("display_slide"),
	MEM_DISPLAY_SLIDE_WIDGET("mem_display_slide_widget"),
	MEM_DASHBOARD_WIDGET("mem_dashboard_widget"),
	REL_USER_ORGANIZATION("rel_user_organization"),
	REL_ROLE_USER("rel_role_user"),
	REL_ROLE_PROJECT("rel_role_project"),
	REL_PROJECT_ADMIN("rel_project_admin"),
	REL_ROLE_SLIDE("rel_role_slide"),
	REL_ROLE_DASHBOARD("rel_role_dashboard"),
	REL_ROLE_DASHBOARD_WIDGET("rel_role_dashboard_widget"),
	REL_ROLE_PORTAL("rel_role_portal"),
	REL_ROLE_DISPLAY("rel_role_display"),
	REL_ROLE_DISPLAY_SLIDE_WIDGET("rel_role_display_slide_widget");

	private String tableType;

	public String getTableType() {
		return tableType;
	}

	TableTypeEnum(String tableType) {
		this.tableType = tableType;
	}


}