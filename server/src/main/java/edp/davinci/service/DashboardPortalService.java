package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.dashboardDto.DashboardPortalCreate;
import edp.davinci.dto.dashboardDto.DashboardPortalUpdate;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;

public interface DashboardPortalService extends CheckEntityService {
    ResultMap getDashboardPortals(Long projectId, User user, HttpServletRequest request);

    ResultMap createDashboardPortal(DashboardPortalCreate dashboardPortalCreate, User user, HttpServletRequest request);

    ResultMap updateDashboardPortal(DashboardPortalUpdate dashboardPortalUpdate, User user, HttpServletRequest request);

    ResultMap deleteDashboardPortal(Long id, User user, HttpServletRequest request);

}
