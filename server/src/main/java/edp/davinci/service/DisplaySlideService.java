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
import edp.davinci.model.DisplaySlide;
import edp.davinci.model.MemDisplaySlideWidget;
import edp.davinci.model.Role;
import edp.davinci.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DisplaySlideService extends CheckEntityService {

    DisplayWithSlides getDisplaySlideList(Long displayId, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    SlideWithMem getDisplaySlideMem(Long displayId, Long slideId, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    DisplaySlide createDisplaySlide(DisplaySlideCreate displaySlideCreate, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean updateDisplaySildes(Long displayId, DisplaySlide[] displaySlides, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean deleteDisplaySlide(Long slideId, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    List<MemDisplaySlideWidget> addMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidgetCreate[] slideWidgetCreates, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean updateMemDisplaySlideWidget(MemDisplaySlideWidget memDisplaySlideWidget, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean deleteMemDisplaySlideWidget(Long relationId, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean deleteDisplaySlideWidgetList(Long displayId, Long slideId, Long[] memIds, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean updateMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidgetDto[] memDisplaySlideWidgets, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    String uploadSlideBGImage(Long slideId, MultipartFile file, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    String uploadSlideSubWidgetBGImage(Long relationId, MultipartFile file, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    List<Long> getSlideExecludeRoles(Long id);

    boolean postSlideVisibility(Role role, VizVisibility vizVisibility, User user) throws NotFoundException, UnAuthorizedException, ServerException;

    boolean copySlides(Long originDisplayId, Long displayId, User user);
}
