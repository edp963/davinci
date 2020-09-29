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

package edp.davinci.service;

import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedException;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.shareDto.ShareEntity;
import edp.davinci.service.share.ShareResult;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.widgetDto.WidgetCreate;
import edp.davinci.dto.widgetDto.WidgetUpdate;
import edp.davinci.model.User;
import edp.davinci.model.Widget;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface WidgetService extends CheckEntityService {
    List<Widget> getWidgets(Long projectId, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    Widget createWidget(WidgetCreate widgetCreate, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean updateWidget(WidgetUpdate widgetUpdate, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean deleteWidget(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    ShareResult shareWidget(Long id, User user, ShareEntity shareEntity) throws NotFoundException, UnAuthorizedException, ServerException;

    Widget getWidget(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    String generationFile(Long id, ViewExecuteParam executeParam, User user, String type) throws NotFoundException, ServerException, UnAuthorizedException;

    File writeExcel(Set<Widget> widgets, ProjectDetail projectDetail, Map<Long, ViewExecuteParam> executeParamMap, String filePath, User user, boolean containType) throws Exception;

    String showSql(Long id, ViewExecuteParam executeParam, User user) throws NotFoundException, UnAuthorizedException, ServerException;
}
