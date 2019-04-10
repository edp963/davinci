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
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.widgetDto.WidgetCreate;
import edp.davinci.dto.widgetDto.WidgetUpdate;
import edp.davinci.model.User;
import edp.davinci.model.Widget;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.util.Map;
import java.util.Set;

public interface WidgetService extends CheckEntityService {
    ResultMap getWidgets(Long projectId, User user, HttpServletRequest request);

    ResultMap createWidget(WidgetCreate widgetCreate, User user, HttpServletRequest request);

    ResultMap updateWidget(WidgetUpdate widgetUpdate, User user, HttpServletRequest request);

    ResultMap deleteWidget(Long id, User user, HttpServletRequest request);

    ResultMap shareWidget(Long id, User user, String username, HttpServletRequest request);

    ResultMap getWidget(Long id, User user, HttpServletRequest request);

    ResultMap generationFile(Long id, ViewExecuteParam executeParam, User user, String type, HttpServletRequest request);

    void upgradeWidgetConfig();

    File writeExcel(Set<Widget> widgets, Map<Long, ViewExecuteParam> executeParamMap, String filePath, User user, boolean containType) throws Exception;
}
