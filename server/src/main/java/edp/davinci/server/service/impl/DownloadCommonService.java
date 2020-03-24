/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2019 EDP
 *  ==
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *        http://www.apache.org/licenses/LICENSE-2.0
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *  >>
 *
 */

package edp.davinci.server.service.impl;

import com.google.common.collect.Lists;

import edp.davinci.commons.util.DateUtils;
import edp.davinci.core.dao.entity.Dashboard;
import edp.davinci.core.dao.entity.MemDashboardWidget;
import edp.davinci.server.component.excel.WidgetContext;
import edp.davinci.server.dao.DashboardExtendMapper;
import edp.davinci.server.dao.MemDashboardWidgetExtendMapper;
import edp.davinci.server.dao.WidgetExtendMapper;
import edp.davinci.server.dto.project.ProjectDetail;
import edp.davinci.server.dto.project.ProjectPermission;
import edp.davinci.server.dto.view.DownloadViewExecuteParam;
import edp.davinci.server.dto.view.ViewExecuteParam;
import edp.davinci.server.enums.DownloadType;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.core.dao.entity.User;
import edp.davinci.core.dao.entity.Widget;
import edp.davinci.server.service.ProjectService;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.util.TokenUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import static edp.davinci.server.commons.Constants.UNDERLINE;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
public class DownloadCommonService {

    @Autowired
    protected MemDashboardWidgetExtendMapper memDashboardWidgetExtendMapper;

    @Autowired
    protected ProjectService projectService;

    @Autowired
    protected WidgetExtendMapper widgetMapper;

    @Autowired
    protected DashboardExtendMapper dashboardExtendMapper;

    @Autowired
    protected TokenUtils tokenUtils;

    @Value("${source.result-limit:1000000}")
    protected int resultLimit;

    protected List<WidgetContext> getWidgetContextListByDashBoardId(List<Long> dashboardIds, List<DownloadViewExecuteParam> params) {
        List<WidgetContext> widgetList = Lists.newArrayList();
        if (CollectionUtils.isEmpty(dashboardIds)) {
            return widgetList;
        }
        for (Long dashboardId : dashboardIds) {
            if (dashboardId == null || dashboardId.longValue() <= 0) {
                continue;
            }
            Dashboard dashboard = dashboardExtendMapper.selectByPrimaryKey(dashboardId);
            if (dashboard == null) {
                continue;
            }
            List<MemDashboardWidget> mdw = memDashboardWidgetExtendMapper.getByDashboardId(dashboardId);
            if (CollectionUtils.isEmpty(mdw)) {
                continue;
            }
            Set<Long> widgetIds = mdw.stream().filter(y -> y != null).map(y -> y.getWidgetId()).collect(Collectors.toSet());
            List<Widget> widgets = widgetMapper.getByIds(widgetIds);
            if (!CollectionUtils.isEmpty(widgets)) {
                Map<Long, MemDashboardWidget> map = mdw.stream().collect(Collectors.toMap(o -> o.getWidgetId(), o -> o));
                widgets.stream().forEach(t -> {
                    ViewExecuteParam executeParam = null;
                    if (!CollectionUtils.isEmpty(params) && map.containsKey(t.getId())) {
                        MemDashboardWidget memDashboardWidget = map.get(t.getId());
                        try {
                            executeParam = params.stream().filter(p -> null != p.getParam() && p.getId().equals(memDashboardWidget.getId())).findFirst().get().getParam();
                        } catch (Exception e) {
                        }
                    }
                    widgetList.add(new WidgetContext(t, dashboard, map.get(t.getId()), executeParam));
                });
            }
        }
        return widgetList;
    }

    protected List<WidgetContext> getWidgetContextListByFolderDashBoardId(Long id) {
        List<WidgetContext> widgetList = Lists.newArrayList();
        if (id == null || id.longValue() < 0L) {
            return widgetList;
        }
        List<Dashboard> dashboardList = dashboardExtendMapper.getSubDashboardById(id);
        if (CollectionUtils.isEmpty(dashboardList)) {
            return widgetList;
        }
        List<Long> dashboardIds = dashboardList.stream().filter(x -> x != null).map(x -> x.getId()).collect(Collectors.toList());
        if (CollectionUtils.isEmpty(dashboardIds)) {
            return widgetList;
        }
        return getWidgetContextListByDashBoardId(dashboardIds, null);
    }

    protected String getDownloadFileName(DownloadType downloadType, Long id) {
        String fileName;
        switch (downloadType) {
            case Widget:
                Widget widget = widgetMapper.selectByPrimaryKey(id);
                fileName = widget.getName();
                break;
            case DashBoard:
            case DashBoardFolder:
                Dashboard dashboard = dashboardExtendMapper.selectByPrimaryKey(id);
                fileName = dashboard.getName();
                break;
            default:
                throw new IllegalArgumentException("Unsupported downloadType:" + downloadType.name());
        }
        return fileName + UNDERLINE + DateUtils.toyyyyMMddHHmmss(System.currentTimeMillis());
    }

    protected List<WidgetContext> getWidgetContexts(DownloadType downloadType, Long id, User user, List<DownloadViewExecuteParam> params) {
        List<WidgetContext> widgetList = Lists.newArrayList();
        switch (downloadType) {
            case Widget:
                Widget widget = widgetMapper.selectByPrimaryKey(id);
                if (widget != null) {
                    ViewExecuteParam executeParam = null;
                    if (!CollectionUtils.isEmpty(params)) {
                        try {
                            executeParam = params.stream()
                                    .filter(p -> null != p.getParam() && p.getId().equals(widget.getId())).findFirst()
                                    .get().getParam();
                        }
                        catch (Exception e) {
                            // ignore
                        }
                    }
                    widgetList.add(new WidgetContext(widget, null, null, executeParam));
                }
                break;
            case DashBoard:
                List<WidgetContext> widgets = getWidgetContextListByDashBoardId(Lists.newArrayList(id), params);
                if (!CollectionUtils.isEmpty(widgets)) {
                    widgetList.addAll(widgets);
                }
                break;
            case DashBoardFolder:
                List<WidgetContext> widgets1 = getWidgetContextListByFolderDashBoardId(id);
                if (!CollectionUtils.isEmpty(widgets1)) {
                    widgetList.addAll(widgets1);
                }
                break;
            default:
                throw new IllegalArgumentException("Unsupported downloadType:" + downloadType.name());
        }
        if (CollectionUtils.isEmpty(widgetList)) {
            throw new IllegalArgumentException("No widget to download");
        }
        for (WidgetContext context : widgetList) {
            ProjectDetail projectDetail = projectService.getProjectDetail(context.getWidget().getProjectId(), user, false);
            ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
            //校验权限
            if (!projectPermission.getDownloadPermission()) {
                log.info("User({}) have not permisson to download the widget {}", user.getUsername(), id);
                throw new UnAuthorizedExecption("You have not permission to download the widget");
            }
            context.setIsMaintainer(projectService.isMaintainer(projectDetail, user));
        }
        return widgetList;
    }
}
