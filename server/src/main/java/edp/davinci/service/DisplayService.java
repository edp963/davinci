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
import edp.davinci.dto.displayDto.*;
import edp.davinci.dto.roleDto.VizVisibility;
import edp.davinci.dto.shareDto.ShareEntity;
import edp.davinci.model.*;
import edp.davinci.service.share.ShareResult;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DisplayService extends CheckEntityService {

    List<Display> getDisplayListByProject(Long projectId, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    Display createDisplay(DisplayInfo displayInfo, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean updateDisplay(DisplayUpdate displayUpdate, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean deleteDisplay(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    String uploadAvatar(MultipartFile file) throws ServerException;

    ShareResult shareDisplay(Long id, User user, ShareEntity shareEntity) throws NotFoundException, UnAuthorizedException, ServerException;

    void deleteSlideAndDisplayByProject(Long projectId) throws RuntimeException;

    List<Long> getDisplayExcludeRoles(Long id);

    boolean postDisplayVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    Display copyDisplay(Long id, DisplayCopy copy, User user) throws NotFoundException, UnAuthorizedException, ServerException;
}
