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

package edp.davinci.server.service;

import com.github.pagehelper.PageInfo;

import edp.davinci.core.dao.entity.Project;
import edp.davinci.server.dto.project.*;
import edp.davinci.server.dto.role.RoleProject;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.core.dao.entity.User;

import java.util.List;

public interface ProjectService extends CheckEntityService {

    ProjectInfo getProjectInfo(Long id, User user);

    List<ProjectInfo> getProjects(User user) throws ServerException;

    ProjectInfo createProject(ProjectCreat projectCreat, User user) throws ServerException, UnAuthorizedExecption, NotFoundException;

    Project updateProject(Long id, ProjectUpdate projectUpdate, User user) throws ServerException, UnAuthorizedExecption, NotFoundException;

    boolean deleteProject(Long id, User user) throws ServerException, UnAuthorizedExecption, NotFoundException;

    Project transferProject(Long id, Long orgId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException;

    PageInfo<ProjectWithCreateBy> searchProjects(String keywords, User user, int pageNum, int pageSize);

    boolean favoriteProject(Long id, User user) throws ServerException, UnAuthorizedExecption, NotFoundException;

    List<ProjectInfo> getFavoriteProjects(User user);

    boolean removeFavoriteProjects(User user, Long[] projectIds) throws ServerException, UnAuthorizedExecption, NotFoundException;

    List<RelProjectAdminDTO> addAdmins(Long id, List<Long> adminIds, User user) throws ServerException, UnAuthorizedExecption, NotFoundException;

    boolean removeAdmin(Long relationId, User user) throws ServerException, UnAuthorizedExecption, NotFoundException;

    ProjectDetail getProjectDetail(Long id, User user, boolean modify) throws NotFoundException, UnAuthorizedExecption;

    List<RoleProject> postRoles(Long id, List<Long> roleIds, User user) throws ServerException, UnAuthorizedExecption, NotFoundException;

    PageInfo<ProjectWithCreateBy> getProjectsByOrg(Long id, User user, String keyword, int pageNum, int pageSize);

    ProjectPermission getProjectPermission(ProjectDetail projectDetail, User user);

    boolean allowGetData(ProjectDetail projectDetail, User user);

    List<RelProjectAdminDTO> getAdmins(Long id, User user) throws NotFoundException, UnAuthorizedExecption;

    boolean isMaintainer(ProjectDetail projectDetail, User user);
}
