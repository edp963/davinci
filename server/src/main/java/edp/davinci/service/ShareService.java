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

import edp.core.exception.ForbiddenExecption;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.model.Paginate;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.shareDto.ShareDashboard;
import edp.davinci.dto.shareDto.ShareDisplay;
import edp.davinci.dto.shareDto.ShareInfo;
import edp.davinci.dto.shareDto.ShareWidget;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.viewDto.DistinctParam;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;
import java.sql.SQLException;
import java.util.Map;

public interface ShareService {
    ShareWidget getShareWidget(String token, User user) throws NotFoundException, ServerException, ForbiddenExecption, UnAuthorizedExecption;

    String generateShareToken(Long shareEntityId, String username, Long userId) throws ServerException;

    User shareLogin(String token, UserLogin userLogin) throws NotFoundException, ServerException, UnAuthorizedExecption;

    ShareDisplay getShareDisplay(String token, User user) throws NotFoundException, ServerException, ForbiddenExecption, UnAuthorizedExecption;

    ShareDashboard getShareDashboard(String token, User user) throws NotFoundException, ServerException, ForbiddenExecption, UnAuthorizedExecption;

    Paginate<Map<String, Object>> getShareData(String token, ViewExecuteParam executeParam, User user) throws NotFoundException, ServerException, ForbiddenExecption, UnAuthorizedExecption, SQLException;

    String generationShareDataCsv(ViewExecuteParam executeParam, User user, String token) throws NotFoundException, ServerException, ForbiddenExecption, UnAuthorizedExecption;

    ResultMap getDistinctValue(String token, Long viewId, DistinctParam param, User user, HttpServletRequest request);

    ShareInfo getShareInfo(String token, User user) throws ServerException, ForbiddenExecption;
}
