package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class RelRoleDashboard {
    private Long roleId;

    private Long dashboardId;

    private Boolean visible;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;


	public RelRoleDashboard(Long dashboardId, Long roleId) {
		this.dashboardId = dashboardId;
		this.roleId = roleId;
	}

	public RelRoleDashboard() {
	}
}