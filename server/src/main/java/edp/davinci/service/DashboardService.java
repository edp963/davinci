package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.dashboardDto.DashboardCreate;
import edp.davinci.dto.dashboardDto.MemDashboardWidgetCreate;
import edp.davinci.model.Dashboard;
import edp.davinci.model.MemDashboardWidget;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;

public interface DashboardService extends CheckEntityService {

    ResultMap getDashboards(Long portalId, User user, HttpServletRequest request);

    ResultMap getDashboardMemWidgets(Long portalId, Long dashboardId, User user, HttpServletRequest request);

    ResultMap createDashboard(DashboardCreate dashboardCreate, User user, HttpServletRequest request);

    ResultMap updateDashboards(Long portalId, Dashboard[] dashboards, User user, HttpServletRequest request);

    ResultMap deleteDashboard(Long id, User user, HttpServletRequest request);

    ResultMap createMemDashboardWidget(Long portalId, Long dashboardId, MemDashboardWidgetCreate memDashboardWidgetCreate, User user, HttpServletRequest request);

    ResultMap updateMemDashboardWidget(MemDashboardWidget memDashboardWidget, User user, HttpServletRequest request);

    ResultMap deleteMemDashboardWidget(Long relationId, User user, HttpServletRequest request);

    ResultMap shareDashboard(Long dashboardId, String username, User user, HttpServletRequest request);

    void deleteDashboardAndPortalByProject(Long projectId) throws RuntimeException;
}
