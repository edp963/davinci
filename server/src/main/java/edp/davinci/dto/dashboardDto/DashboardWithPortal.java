package edp.davinci.dto.dashboardDto;

import edp.davinci.model.Dashboard;
import edp.davinci.model.DashboardPortal;
import edp.davinci.model.Project;
import lombok.Data;

@Data
public class DashboardWithPortal extends Dashboard {
    private DashboardPortal portal;
    private Project project;
}
