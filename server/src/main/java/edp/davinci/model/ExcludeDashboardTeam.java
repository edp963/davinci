package edp.davinci.model;

import lombok.Data;

import java.util.Date;

@Data
public class ExcludeDashboardTeam {

    private Long id;

    private Long teamId;

    private Long dashboardId;

    private Long updateBy;

    private Date updateTime = new Date();

    public ExcludeDashboardTeam(Long teamId, Long dashboardId, Long updateBy) {
        this.teamId = teamId;
        this.dashboardId = dashboardId;
        this.updateBy = updateBy;
    }

    public ExcludeDashboardTeam() {
    }
}