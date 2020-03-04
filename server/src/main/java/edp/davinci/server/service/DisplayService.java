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

import edp.davinci.core.dao.entity.Display;
import edp.davinci.server.dto.display.*;
import edp.davinci.server.dto.role.VizVisibility;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.*;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DisplayService extends CheckEntityService {

    List<Display> getDisplayListByProject(Long projectId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    Display createDisplay(DisplayInfo displayInfo, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    boolean updateDisplay(DisplayUpdate displayUpdate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    boolean deleteDisplay(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    String uploadAvatar(MultipartFile file) throws ServerException;

    String shareDisplay(Long id, User user, String username) throws NotFoundException, UnAuthorizedExecption, ServerException;

    void deleteSlideAndDisplayByProject(Long projectId) throws RuntimeException;

    List<Long> getDisplayExcludeRoles(Long id);

    boolean postDisplayVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    Display copyDisplay(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;
}
