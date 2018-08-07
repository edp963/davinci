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

import edp.core.exception.ServerException;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;

public interface ShareService {
    ResultMap getShareWidget(String token, User user, HttpServletRequest request);

    String generateShareToken(Long shareEntityId, String username, Long userId) throws ServerException;

    ResultMap shareLogin(String token, UserLogin userLogin);

    ResultMap getShareDisplay(String token, User user, HttpServletRequest request);

    ResultMap getShareDashboard(String token, User user, HttpServletRequest request);

    ResultMap getShareData(String token, ViewExecuteParam executeParam, User user, HttpServletRequest request);

    ResultMap generationShareDataCsv(String token, ViewExecuteParam executeParam, User user, HttpServletRequest request);

}
