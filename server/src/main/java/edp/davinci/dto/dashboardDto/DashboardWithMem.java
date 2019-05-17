package edp.davinci.dto.dashboardDto;

import edp.davinci.model.Dashboard;
import edp.davinci.model.MemDashboardWidget;
import edp.davinci.model.View;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class DashboardWithMem extends Dashboard {
    List<MemDashboardWidget> widgets;
    Set<View> views;
}
