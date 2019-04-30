package edp.davinci.model;

import edp.davinci.common.model.RecordInfo;
import lombok.Data;

@Data
public class RelRoleDashboard extends RecordInfo<RelRoleDashboard> {
    private Long id;

    private Long roleId;

    private Long dashboardId;

    private Boolean visible = false; // 可见/不可见  true/false

    public RelRoleDashboard(Long dashboardId, Long roleId) {
        this.dashboardId = dashboardId;
        this.roleId = roleId;
    }

    public RelRoleDashboard() {
    }
}