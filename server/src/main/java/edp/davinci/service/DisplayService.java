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
import edp.davinci.dto.displayDto.DisplayInfo;
import edp.davinci.dto.displayDto.DisplaySlideCreate;
import edp.davinci.dto.displayDto.DisplayUpdateDto;
import edp.davinci.dto.displayDto.MemDisplaySlideWidgetCreate;
import edp.davinci.model.DisplaySlide;
import edp.davinci.model.MemDisplaySlideWidget;
import edp.davinci.model.User;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface DisplayService extends CheckEntityService {

    ResultMap getDisplayListByProject(Long projectId, User user, HttpServletRequest request);

    ResultMap getDisplaySlideList(Long id, User user, HttpServletRequest request);

    ResultMap getDisplaySlideWidgetList(Long displayId, Long slideId, User user, HttpServletRequest request);

    ResultMap createDisplay(DisplayInfo displayInfo, User user, HttpServletRequest request);

    ResultMap updateDisplay(DisplayUpdateDto displayUpdateDto, User user, HttpServletRequest request);

    ResultMap deleteDisplay(Long id, User user, HttpServletRequest request);

    ResultMap createDisplaySlide(DisplaySlideCreate displaySlideCreate, User user, HttpServletRequest request);

    ResultMap updateDisplaySildes(Long displayId, DisplaySlide[] displaySlides, User user, HttpServletRequest request);

    ResultMap deleteDisplaySlide(Long slideId, User user, HttpServletRequest request);

    ResultMap addMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidgetCreate[] slideWidgetCreates, User user, HttpServletRequest request);

    ResultMap updateMemDisplaySlideWidget(MemDisplaySlideWidget memDisplaySlideWidget, User user, HttpServletRequest request);

    ResultMap deleteMemDisplaySlideWidget(Long relationId, User user, HttpServletRequest request);

    ResultMap deleteDisplaySlideWidgetList(Long displayId, Long slideId, Long[] memIds, User user, HttpServletRequest request);

    ResultMap updateMemDisplaySlideWidgets(Long displayId, Long slideId, MemDisplaySlideWidget[] memDisplaySlideWidgets, User user, HttpServletRequest request);

    ResultMap uploadAvatar(MultipartFile file, HttpServletRequest request);

    ResultMap uploadSlideBGImage(Long slideId, MultipartFile file, User user, HttpServletRequest request);

    ResultMap shareDisplay(Long id, User user, String username, HttpServletRequest request);

    void deleteSlideAndDisplayByProject(Long projectId) throws RuntimeException;

    ResultMap uploadSlideSubWidgetBGImage(Long relationId, MultipartFile file, User user, HttpServletRequest request);

    List<Long> getDisplayExcludeTeams(Long id);
}
