package edp.davinci.service.impl;

import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.dao.DashboardMapper;
import edp.davinci.dao.DashboardPortalMapper;
import edp.davinci.dao.MemDashboardWidgetMapper;
import edp.davinci.dao.WidgetMapper;
import edp.davinci.dto.dashboardDto.DashboardCreate;
import edp.davinci.dto.dashboardDto.DashboardWithPortal;
import edp.davinci.dto.dashboardDto.MemDashboardWidgetCreate;
import edp.davinci.dto.dashboardDto.PortalWithProject;
import edp.davinci.model.*;
import edp.davinci.service.DashboardService;
import edp.davinci.service.ShareService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service("dashboardService")
public class DashboardServiceImpl extends CommonService<Dashboard> implements DashboardService {

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Autowired
    private DashboardPortalMapper dashboardPortalMapper;

    @Autowired
    private MemDashboardWidgetMapper memDashboardWidgetMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private ShareService shareService;


    @Override
    public boolean isExist(String name, Long id, Long portalId) {
        Long dashboardId = dashboardMapper.getByNameWithPortalId(name, portalId);
        if (null != id && null != dashboardId) {
            return !id.equals(dashboardId);
        }
        return null != dashboardId && dashboardId.longValue() > 0L;
    }

    /**
     * 获取dashboard列表
     *
     * @param portalId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getDashboards(Long portalId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        PortalWithProject portal = dashboardPortalMapper.getPortalWithProjectById(portalId);

        if (null == portal) {
            return resultMap.failAndRefreshToken(request).message("dashboard portal not found");
        }

        Project project = portal.getProject();
        if (null == project) {
            return resultMap.failAndRefreshToken(request).message("Invalid dashboard portal");
        }

        if (!allowRead(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<Dashboard> dashboardList = dashboardMapper.getByPortalId(portalId);

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        if (!project.getUserId().equals(user.getId()) && (null == orgRel|| orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
            short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());
            if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {
                short maxSourcePermission = relTeamProjectMapper.getMaxWidgetPermission(project.getId(), user.getId());
                if (maxSourcePermission == UserPermissionEnum.HIDDEN.getPermission()) {
                    dashboardList = null;
                } else if (maxSourcePermission == UserPermissionEnum.READ.getPermission()) {
                    if (!portal.getPublish()) {
                        dashboardList = null;
                    }
                }
            }
        }

        return resultMap.successAndRefreshToken(request).payloads(dashboardList);
    }

    /**
     * 获取dashboard下widgets关联信息列表
     *
     * @param portalId
     * @param dashboardId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getDashboardMemWidgets(Long portalId, Long dashboardId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(dashboardId);
        if (null == dashboardWithPortalAndProject) {
            return resultMap.failAndRefreshToken(request).message("dashboard not found");
        }

        DashboardPortal portal = dashboardWithPortalAndProject.getPortal();
        if (null == portal || !portal.getId().equals(portalId)) {
            return resultMap.failAndRefreshToken(request).message("Invalid dashboard");
        }

        Project project = dashboardWithPortalAndProject.getProject();
        if (null == project) {
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        if (!allowRead(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<MemDashboardWidget> memDashboardWidgets = memDashboardWidgetMapper.getByDashboardId(dashboardId);

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        if (!project.getUserId().equals(user.getId()) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
            short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());
            if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {
                short maxSourcePermission = relTeamProjectMapper.getMaxWidgetPermission(project.getId(), user.getId());
                if (maxSourcePermission == UserPermissionEnum.HIDDEN.getPermission()) {
                    memDashboardWidgets = null;
                } else if (maxSourcePermission == UserPermissionEnum.READ.getPermission()) {
                    if (!portal.getPublish()) {
                        memDashboardWidgets = null;
                    }
                }
            }
        }

        return resultMap.successAndRefreshToken(request).payloads(memDashboardWidgets);
    }


    /**
     * 新建dashboard
     *
     * @param dashboardCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createDashboard(DashboardCreate dashboardCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        PortalWithProject portalWithProject = dashboardPortalMapper.getPortalWithProjectById(dashboardCreate.getDashboardPortalId());

        if (null == portalWithProject) {
            return resultMap.failAndRefreshToken(request).message("dashboard portal not found");
        }

        Project project = portalWithProject.getProject();

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create dashboard", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create dashboard");
        }

        if (isExist(dashboardCreate.getName(), null, dashboardCreate.getDashboardPortalId())) {
            log.info("the dashboard \"{}\" name is already taken", dashboardCreate.getName());
            return resultMap.failAndRefreshToken(request).message("the dashboard name is already taken");
        }

        Dashboard dashboard = new Dashboard();
        BeanUtils.copyProperties(dashboardCreate, dashboard);


        int insert = dashboardMapper.insert(dashboard);
        if (insert > 0) {
            return resultMap.successAndRefreshToken(request).payload(dashboard);
        } else {
            return resultMap.failAndRefreshToken(request).message("create dashboard fail");
        }
    }

    /**
     * 修改dashboard
     *
     * @param portalId
     * @param dashboards
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateDashboards(Long portalId, Dashboard[] dashboards, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        PortalWithProject portalWithProject = dashboardPortalMapper.getPortalWithProjectById(portalId);

        if (null == portalWithProject) {
            return resultMap.failAndRefreshToken(request).message("dashboard portal not found");
        }

        Project project = portalWithProject.getProject();

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create dashboard", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create dashboard");
        }

        for (Dashboard dashboard : dashboards) {
            if (!dashboard.getDashboardPortalId().equals(portalId)) {
                return resultMap.failAndRefreshToken(request).message("Invalid dashboard portal id");
            }

            if (isExist(dashboard.getName(), dashboard.getId(), dashboard.getDashboardPortalId())) {
                log.info("the dashboard \"{}\" name is already taken", dashboard.getName());
                return resultMap.failAndRefreshToken(request).message("the dashboard name \"" + dashboard.getName() + "\" is already taken");
            }
        }

        List<Dashboard> dashboardList = new ArrayList<>(Arrays.asList(dashboards));
        dashboardMapper.updateBatch(dashboardList);
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 删除dashboard
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteDashboard(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(id);

        if (null == dashboardWithPortalAndProject) {
            log.info("dashboard (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("dashboard not found");
        }

        //校验权限
        if (!allowDelete(dashboardWithPortalAndProject.getProject(), user)) {
            log.info("user {} have not permisson to delete the dashboard{}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to delete the dashboard");
        }

        dashboardMapper.deleteByParentId(id);
        dashboardMapper.deleteById(id);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 在dashboard下新建widget关联
     *
     * @param portalId
     * @param dashboardId
     * @param memDashboardWidgetCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createMemDashboardWidget(Long portalId, Long dashboardId, MemDashboardWidgetCreate memDashboardWidgetCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(dashboardId);

        if (null == dashboardWithPortalAndProject) {
            log.info("dashboard (:{}) not found", dashboardId);
            return resultMap.failAndRefreshToken(request).message("dashboard not found");
        }

        if (!dashboardWithPortalAndProject.getDashboardPortalId().equals(portalId)) {
            return resultMap.failAndRefreshToken(request).message("Invalid dashboard");
        }

        //校验权限
        if (!allowWrite(dashboardWithPortalAndProject.getProject(), user)) {
            log.info("user {} have not permisson to do this operation", user.getUsername(), dashboardId);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to do this operation");
        }

        Widget widget = widgetMapper.getById(memDashboardWidgetCreate.getWidgetId());
        if (null == widget) {
            return resultMap.failAndRefreshToken(request).message("widget not found");
        }

        if (!widget.getProjectId().equals(dashboardWithPortalAndProject.getProject().getId())) {
            return resultMap.failAndRefreshToken(request).message("Invalid project id");
        }

        if (memDashboardWidgetCreate.getPolling() && memDashboardWidgetCreate.getFrequency() < 1) {
            return resultMap.failAndRefreshToken(request).message("Invalid frequency");
        }

        MemDashboardWidget memDashboardWidget = new MemDashboardWidget();
        BeanUtils.copyProperties(memDashboardWidgetCreate, memDashboardWidget);
        int insert = memDashboardWidgetMapper.insert(memDashboardWidget);
        if (insert > 0) {
            return resultMap.successAndRefreshToken(request).payload(memDashboardWidget);
        } else {
            return resultMap.failAndRefreshToken(request).message("unkown fail");
        }
    }

    /**
     * 修改dashboard下的widget关联信息
     *
     * @param memDashboardWidget
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateMemDashboardWidget(MemDashboardWidget memDashboardWidget, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(memDashboardWidget.getDashboardId());

        if (null == dashboardWithPortalAndProject) {
            return resultMap.failAndRefreshToken(request).message("Invalid dashboard id");
        }

        if (!allowWrite(dashboardWithPortalAndProject.getProject(), user)) {
            log.info("user (:{}) have not permission to update memDashboardWidget (:{})", user.getId(), memDashboardWidget.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to do this operation");
        }

        Widget widget = widgetMapper.getById(memDashboardWidget.getWidgetId());
        if (null == widget) {
            return resultMap.failAndRefreshToken(request).message("widget not found");
        }

        if (memDashboardWidget.getPolling() && memDashboardWidget.getFrequency() < 1) {
            return resultMap.failAndRefreshToken(request).message("Invalid frequency");
        }

        memDashboardWidgetMapper.update(memDashboardWidget);
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 删除dashboard下的widget关联信息
     *
     * @param relationId
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteMemDashboardWidget(Long relationId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        MemDashboardWidget memDashboardWidget = memDashboardWidgetMapper.getById(relationId);
        if (null == memDashboardWidget) {
            return resultMap.successAndRefreshToken(request);
        }

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(memDashboardWidget.getDashboardId());

        if (null == dashboardWithPortalAndProject) {
            return resultMap.failAndRefreshToken(request).message("Invalid dashboard id");
        }

        if (!allowDelete(dashboardWithPortalAndProject.getProject(), user)) {
            log.info("user ({}) have not permission to delete memDashboardWidget ({})", user.getId(), memDashboardWidget.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to do this operation");
        }

        memDashboardWidgetMapper.deleteById(relationId);
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 分享dashboard
     *
     * @param dashboardId
     * @param username
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap shareDashboard(Long dashboardId, String username, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        DashboardWithPortal dashboardWithPortalAndProject = dashboardMapper.getDashboardWithPortalAndProject(dashboardId);

        if (null == dashboardWithPortalAndProject) {
            log.info("dashboard (:{}) not found", dashboardId);
            return resultMap.failAndRefreshToken(request).message("dashboard not found");
        }

        //校验权限
        if (!allowShare(dashboardWithPortalAndProject.getProject(), user)) {
            log.info("user {} have not permisson to share the dashboard {}", user.getUsername(), user.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to share the dashboard");
        }

        if (dashboardWithPortalAndProject.getType() == 0) {
            return resultMap.failAndRefreshToken(request).message("dashboard folder cannot be shared");
        }

        try {
            return resultMap.successAndRefreshToken(request).payload(shareService.generateShareToken(dashboardId, username, user.getId()));
        } catch (ServerException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteDashboardAndPortalByProject(Long projectId) throws RuntimeException {
        //删除dashboard与widget关联
        memDashboardWidgetMapper.deleteByProject(projectId);
        //删除dashaboard
        dashboardMapper.deleteByProject(projectId);
        //删除dashboardPortal
        dashboardPortalMapper.deleteByProject(projectId);
    }
}
