package edp.davinci.dto.dashboardDto;

import edp.davinci.model.Dashboard;
import edp.davinci.model.MemDashboardWidget;
import lombok.Data;

import java.util.List;

@Data
public class DashboardWithMem extends Dashboard {
    List<MemDashboardWidget> widgets;
}
