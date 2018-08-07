package edp.davinci.dto.dashboardDto;

import edp.davinci.model.DashboardPortal;
import edp.davinci.model.Project;
import lombok.Data;

@Data
public class PortalWithProject extends DashboardPortal {

    private Project project;
}
