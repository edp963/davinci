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
import edp.davinci.dto.sourceDto.*;
import edp.davinci.model.User;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

public interface SourceService extends CheckEntityService {


    ResultMap getSources(Long projectId, User user, HttpServletRequest request);

    ResultMap createSource(SourceCreate sourceCreate, User user, HttpServletRequest request);

    ResultMap updateSource(SourceInfo sourceInfo, User user, HttpServletRequest request);

    ResultMap deleteSrouce(Long id, User user, HttpServletRequest request);

    ResultMap testSource(SourceTest sourceTest, User user, HttpServletRequest request);

    ResultMap validCsvmeta(Long sourceId, UploadMeta uploadMeta, User user, HttpServletRequest request);

    ResultMap dataUpload(Long sourceId, SourceDataUpload sourceDataUpload, MultipartFile file, User user, String type, HttpServletRequest request);
}
