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
import edp.davinci.dto.dashboardDto.DashboardPortalCreate;
import edp.davinci.dto.dashboardDto.DashboardPortalUpdate;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface DashboardPortalService extends CheckEntityService {
    ResultMap getDashboardPortals(Long projectId, User user, HttpServletRequest request);

    ResultMap createDashboardPortal(DashboardPortalCreate dashboardPortalCreate, User user, HttpServletRequest request);

    ResultMap updateDashboardPortal(DashboardPortalUpdate dashboardPortalUpdate, User user, HttpServletRequest request);

    ResultMap deleteDashboardPortal(Long id, User user, HttpServletRequest request);

    List<Long> getExcludeTeams(Long id);
}
