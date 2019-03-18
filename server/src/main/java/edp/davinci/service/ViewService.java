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

import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.model.Paginate;
import edp.core.model.PaginateWithQueryColumns;
import edp.core.model.QueryColumn;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.viewDto.*;
import edp.davinci.model.Project;
import edp.davinci.model.User;
import edp.davinci.model.View;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

public interface ViewService extends CheckEntityService {

    List<ViewWithSourceBaseInfo> getViews(Long projectId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    ViewWithSourceBaseInfo createView(ViewCreate viewCreate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    boolean updateView(ViewUpdate viewUpdate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    boolean deleteView(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    PaginateWithQueryColumns executeSql(ViewExecuteSql executeSql, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    Paginate<Map<String, Object>> getData(Long id, ViewExecuteParam executeParam, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    Paginate getResultDataList(ProjectDetail projectDetail, ViewWithSource viewWithSource, ViewExecuteParam executeParam, User user) throws ServerException;

    List<QueryColumn> getResultMeta(ViewWithProjectAndSource viewWithProjectAndSource, ViewExecuteParam executeParam, User user) throws ServerException;

    ResultMap getDistinctValue(Long id, DistinctParam param, User user, HttpServletRequest request);

    boolean allowGetData(Project project, User user);

    List<Map<String, Object>> getDistinctValueData(ViewWithProjectAndSource viewWithProjectAndSource, DistinctParam param, User user) throws ServerException;

    ResultMap getViewConfigTeamVar(Long id, User user, HttpServletRequest request);

    void updateViewTeamVar(View view, String config, Project project, User user);
}
