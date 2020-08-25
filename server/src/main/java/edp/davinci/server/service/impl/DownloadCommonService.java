/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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
import edp.davinci.server.dto.view.WidgetQueryParam;
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

import static edp.davinci.commons.Constants.*;

import java.util.*;
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
            if (dashboardId == null || dashboardId <= 0) {
                continue;
            }
            Dashboard dashboard = dashboardExtendMapper.selectByPrimaryKey(dashboardId);
            if (dashboard == null) {
                continue;
            }
            List<MemDashboardWidget> mdws = memDashboardWidgetExtendMapper.getByDashboardId(dashboardId);
            if (CollectionUtils.isEmpty(mdws)) {
                continue;
            }
            Set<Long> widgetIds = mdws.stream().filter(y -> y != null).map(y -> y.getWidgetId()).collect(Collectors.toSet());
            List<Widget> widgets = widgetMapper.getByIds(widgetIds);
            if (!CollectionUtils.isEmpty(widgets)) {
                // order by mem_dashboard_widget create_time
                widgets = sort(mdws, widgets);
                Map<Long, MemDashboardWidget> map = mdws.stream().collect(Collectors.toMap(o -> o.getWidgetId(), o -> o));
                widgets.stream().forEach(t -> {
                    WidgetQueryParam queryParam = null;
                    if (!CollectionUtils.isEmpty(params) && map.containsKey(t.getId())) {
                        MemDashboardWidget memDashboardWidget = map.get(t.getId());
                        try {
                            queryParam = params.stream().filter(p -> null != p.getParam() && p.getId().equals(memDashboardWidget.getId())).findFirst().get().getParam();
                        } catch (Exception e) {

                        }
                    }
                    widgetList.add(new WidgetContext(t, dashboard, map.get(t.getId()), queryParam));
                });
            }
        }
        return widgetList;
    }

    private List<Widget> sort(List<MemDashboardWidget> memDashboardWidgets, List<Widget> widgets) {
        List<Widget> list = new ArrayList<>();
        memDashboardWidgets.forEach(m -> {
            list.add(widgets.stream().filter(w -> w.getId().equals(m.getWidgetId())).findFirst().get());
        });
        return list;
    }

    protected List<WidgetContext> getWidgetContextListByDashBoardFolderId(Long id) {
        List<WidgetContext> widgetList = Lists.newArrayList();
        if (id == null || id.longValue() < 0L) {
            return widgetList;
        }
        List<Dashboard> dashboardList = dashboardExtendMapper.getSubDashboardById(id);
        if (CollectionUtils.isEmpty(dashboardList)) {
            return widgetList;
        }
        List<Long> dashboardIds = dashboardList.stream().filter(Objects::nonNull).map(Dashboard::getId).collect(Collectors.toList());
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
        String type = downloadType.getDownloadType();
        switch (downloadType) {
            case Widget:
                Widget widget = widgetMapper.selectByPrimaryKey(id);
                if (widget != null) {
                    WidgetQueryParam queryParam = null;
                    if (!CollectionUtils.isEmpty(params)) {
                        try {
                            queryParam = params.stream()
                                    .filter(p -> null != p.getParam() && p.getId().equals(widget.getId())).findFirst()
                                    .get().getParam();
                        } catch (Exception e) {
                            // ignore
                        }
                    }
                    widgetList.add(new WidgetContext(widget, null, null, queryParam));
                }
                break;
            case DashBoard:
                List<WidgetContext> dashboards = getWidgetContextListByDashBoardId(Lists.newArrayList(id), params);
                if (!CollectionUtils.isEmpty(dashboards)) {
                    widgetList.addAll(dashboards);
                }
                break;
            case DashBoardFolder:
                List<WidgetContext> folders = getWidgetContextListByDashBoardFolderId(id);
                if (!CollectionUtils.isEmpty(folders)) {
                    widgetList.addAll(folders);
                }
                break;
            default:
                throw new IllegalArgumentException("Unsupported download type:" + downloadType.name());
        }

        if (CollectionUtils.isEmpty(widgetList)) {
            throw new IllegalArgumentException("No " + type + " to download");
        }

        for (WidgetContext context : widgetList) {
            ProjectDetail projectDetail = projectService.getProjectDetail(context.getWidget().getProjectId(), user, false);
            ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
            //校验权限
            if (!projectPermission.getDownloadPermission()) {
                log.info("User({}) have not permisson to download the {}({})", user.getUsername(), type, id);
                throw new UnAuthorizedExecption("You have not permission to download the " + type);
            }
            context.setIsMaintainer(projectService.isMaintainer(projectDetail, user));
        }

        return widgetList;
    }
}
