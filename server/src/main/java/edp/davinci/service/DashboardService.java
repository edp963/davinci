/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.dashboardDto.DashboardCreate;
import edp.davinci.dto.dashboardDto.DashboardDto;
import edp.davinci.dto.dashboardDto.MemDashboardWidgetCreate;
import edp.davinci.model.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface DashboardService extends CheckEntityService {

    ResultMap getDashboards(Long portalId, User user, HttpServletRequest request);

    ResultMap getDashboardMemWidgets(Long portalId, Long dashboardId, User user, HttpServletRequest request);

    ResultMap createDashboard(DashboardCreate dashboardCreate, User user, HttpServletRequest request);

    ResultMap updateDashboards(Long portalId, DashboardDto[] dashboards, User user, HttpServletRequest request);

    ResultMap deleteDashboard(Long id, User user, HttpServletRequest request);

    ResultMap createMemDashboardWidget(Long portalId, Long dashboardId, MemDashboardWidgetCreate[] memDashboardWidgetCreates, User user, HttpServletRequest request);

    ResultMap updateMemDashboardWidgets(MemDashboardWidget[] memDashboardWidgets, User user, HttpServletRequest request);

    ResultMap deleteMemDashboardWidget(Long relationId, User user, HttpServletRequest request);

    ResultMap shareDashboard(Long dashboardId, String username, User user, HttpServletRequest request);

    void deleteDashboardAndPortalByProject(Long projectId) throws RuntimeException;


    List<Dashboard> getDashboardListByPortal(DashboardPortal portal, User user, Project project);

    List<Long> getExcludeTeams(Long id);
}
