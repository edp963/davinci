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

package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.model.Paginate;
import edp.core.model.QueryColumn;
import edp.core.utils.AESUtils;
import edp.core.utils.FileUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.model.TokenEntity;
import edp.davinci.core.utils.CsvUtils;
import edp.davinci.dao.*;
import edp.davinci.dto.displayDto.MemDisplaySlideWidgetWithSlide;
import edp.davinci.dto.shareDto.*;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.userDto.UserLoginResult;
import edp.davinci.dto.viewDto.DistinctParam;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.viewDto.ViewWithProjectAndSource;
import edp.davinci.model.*;
import edp.davinci.service.ShareService;
import edp.davinci.service.ViewService;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@Slf4j
public class ShareServiceImpl extends CommonService implements ShareService {

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private DisplayMapper displayMapper;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private ViewService viewService;

    @Autowired
    private MemDisplaySlideWidgetMapper memDisplaySlideWidgetMapper;

    @Autowired
    private MemDashboardWidgetMapper memDashboardWidgetMapper;

    @Autowired
    private FileUtils fileUtils;

    @Override
    public ResultMap shareLogin(String token, UserLogin userLogin) {
        //AES解密
        String decrypt = AESUtils.decrypt(token, null);
        //获取分享信息
        String tokenUserName = tokenUtils.getUsername(decrypt);
        String tokenPassword = tokenUtils.getPassword(decrypt);

        String[] tokenInfos = tokenUserName.split(Constants.SPLIT_CHAR_STRING);
        String[] tokenCrypts = tokenPassword.split(Constants.SPLIT_CHAR_STRING);

        if (tokenInfos.length < 2) {
            throw new ServerException("Invalid share token");
        }

        User loginUser = userMapper.selectByUsername(userLogin.getUsername());
        if (null == loginUser) {
            return new ResultMap().fail().payload("username or password invalid").message("user not found");
        }

        Long shareUserId = Long.parseLong(tokenInfos[1]);
        if (shareUserId.longValue() < 1L) {
            throw new ServerException("Invalid share token");
        }

        User shareUser = userMapper.getById(shareUserId);
        if (null == shareUser) {
            throw new ServerException("Invalid share token");
        }

        //校验密码
        if (!BCrypt.checkpw(userLogin.getPassword(), loginUser.getPassword())) {
            return new ResultMap().fail().payload("username or password invalid").message("password is wrong");
        }

        if (tokenInfos.length == 3) {
            if (tokenCrypts.length < 2) {
                throw new ServerException("Invalid share token");
            }
            try {
                String sharedUserName = tokenInfos[2];
                Long sharedUserId = Long.parseLong(tokenCrypts[1]);
                if (!(loginUser.getUsername().equals(sharedUserName) && loginUser.getId().equals(sharedUserId)) && !loginUser.getId().equals(shareUserId)) {
                    return new ResultMap().fail().message("The resource requires authentication, which was not supplied with the request");
                }
            } catch (NumberFormatException e) {
                return new ResultMap().fail().message("The resource requires authentication, which was not supplied with the request");
            }
        }

        //是否激活
        if (!loginUser.getActive()) {
            return new ResultMap().failWithToken(tokenUtils.generateToken(loginUser)).message("this user is not active");
        }

        UserLoginResult userLoginResult = new UserLoginResult();
        BeanUtils.copyProperties(loginUser, userLoginResult);
        return new ResultMap().success(tokenUtils.generateToken(loginUser)).payload(userLoginResult);
    }

    /**
     * 获取分享widget
     *
     * @param token
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getShareWidget(String token, User user, HttpServletRequest request) {

        ShareWidget shareWidget = null;
        try {
            ShareInfo shareInfo = getShareInfo(token, user);
            if (null == shareInfo || shareInfo.getShareId().longValue() < 1L) {
                return resultFail(user, request, null).message("Invalid share token");
            }

            if (!StringUtils.isEmpty(shareInfo.getSharedUserName())) {
                if (!shareInfo.getSharedUserName().equals(user.getUsername())) {
                    resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
                }
            }

            shareWidget = widgetMapper.getShareWidgetById(shareInfo.getShareId());

            if (null == shareWidget) {
                return resultFail(user, request, null).message("widget not found");
            }

            String dateToken = generateShareToken(shareWidget.getViewId(), shareInfo.getSharedUserName(), shareInfo.getShareUser().getId());
            shareWidget.setDataToken(dateToken);
        } catch (ServerException e) {
            return resultFail(user, request, null).message(e.getMessage());
        } catch (UnAuthorizedExecption e) {
            return resultFail(user, request, HttpCodeEnum.FORBIDDEN).message(e.getMessage());
        }

        return resultSuccess(user, request).payload(shareWidget);
    }


    /**
     * 获取分享Display
     *
     * @param token
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getShareDisplay(String token, User user, HttpServletRequest request) {
        ShareDisplay shareDisplay = null;
        try {
            ShareInfo shareInfo = getShareInfo(token, user);
            if (null == shareInfo || shareInfo.getShareId().longValue() < 1L) {
                return resultFail(user, request, null).message("Invalid share token");
            }

            Long displayId = shareInfo.getShareId();
            Display display = displayMapper.getById(displayId);

            if (!StringUtils.isEmpty(shareInfo.getSharedUserName())) {
                if (!shareInfo.getSharedUserName().equals(user.getUsername())) {
                    resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
                }
            }

            if (null == display) {
                return resultFail(user, request, null).message("display not found");
            }

            shareDisplay = new ShareDisplay();

            BeanUtils.copyProperties(display, shareDisplay);

            List<MemDisplaySlideWidgetWithSlide> memWithSlides = memDisplaySlideWidgetMapper.getMemWithSlideByDisplayId(displayId);

            if (null != memWithSlides && memWithSlides.size() > 0) {
                Set<DisplaySlide> displaySlideSet = new HashSet<>();
                Set<MemDisplaySlideWidget> memDisplaySlideWidgetSet = new HashSet<>();
                for (MemDisplaySlideWidgetWithSlide memWithSlide : memWithSlides) {
                    displaySlideSet.add(memWithSlide.getDisplaySlide());
                    MemDisplaySlideWidget memDisplaySlideWidget = new MemDisplaySlideWidget();
                    BeanUtils.copyProperties(memWithSlide, memDisplaySlideWidget);
                    memDisplaySlideWidgetSet.add(memDisplaySlideWidget);
                }

                if (null != displaySlideSet && displaySlideSet.size() > 0) {
                    Set<ShareDisplaySlide> shareDisplaySlideSet = new HashSet<>();
                    Iterator<DisplaySlide> slideIterator = displaySlideSet.iterator();
                    while (slideIterator.hasNext()) {
                        DisplaySlide displaySlide = slideIterator.next();
                        ShareDisplaySlide shareDisplaySlide = new ShareDisplaySlide();
                        BeanUtils.copyProperties(displaySlide, shareDisplaySlide);

                        Iterator<MemDisplaySlideWidget> memIterator = memDisplaySlideWidgetSet.iterator();
                        Set<MemDisplaySlideWidget> relations = new HashSet<>();
                        while (memIterator.hasNext()) {
                            MemDisplaySlideWidget memDisplaySlideWidget = memIterator.next();
                            if (memDisplaySlideWidget.getDisplaySlideId().equals(displaySlide.getId())) {
                                relations.add(memDisplaySlideWidget);
                            }
                        }
                        shareDisplaySlide.setRelations(relations);
                        shareDisplaySlideSet.add(shareDisplaySlide);
                    }
                    shareDisplay.setSlides(shareDisplaySlideSet);
                }
            }

            Set<ShareWidget> shareWidgets = widgetMapper.getShareWidgetsByDisplayId(displayId);
            if (null != shareWidgets && shareWidgets.size() > 0) {
                Iterator<ShareWidget> widgetIterator = shareWidgets.iterator();
                while (widgetIterator.hasNext()) {
                    ShareWidget shareWidget = widgetIterator.next();
                    String dateToken = generateShareToken(shareWidget.getViewId(), shareInfo.getSharedUserName(), shareInfo.getShareUser().getId());
                    shareWidget.setDataToken(dateToken);
                }
                shareDisplay.setWidgets(shareWidgets);
            }
        } catch (ServerException e) {
            return resultFail(user, request, null).message(e.getMessage());
        } catch (UnAuthorizedExecption e) {
            return resultFail(user, request, HttpCodeEnum.FORBIDDEN).message(e.getMessage());
        }

        return resultSuccess(user, request).payload(shareDisplay);
    }

    /**
     * 获取分享dashboard
     *
     * @param token
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getShareDashboard(String token, User user, HttpServletRequest request) {
        ShareDashboard shareDashboard = null;
        try {
            ShareInfo shareInfo = getShareInfo(token, user);
            if (null == shareInfo || shareInfo.getShareId().longValue() < 1L) {
                return resultFail(user, request, null).message("Invalid share token");
            }

            if (!StringUtils.isEmpty(shareInfo.getSharedUserName())) {
                if (!shareInfo.getSharedUserName().equals(user.getUsername())) {
                    resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
                }
            }

            Long dashboardId = shareInfo.getShareId();
            Dashboard dashboard = dashboardMapper.getById(dashboardId);

            if (null == dashboard) {
                return resultFail(user, request, null).message("dashboard not found");
            }

            shareDashboard = new ShareDashboard();
            BeanUtils.copyProperties(dashboard, shareDashboard);

            List<MemDashboardWidget> memDashboardWidgets = memDashboardWidgetMapper.getByDashboardId(dashboardId);
            shareDashboard.setRelations(memDashboardWidgets);

            Set<ShareWidget> shareWidgets = widgetMapper.getShareWidgetsByDashboard(dashboardId);
            if (null != shareWidgets && shareWidgets.size() > 0) {
                Iterator<ShareWidget> iterator = shareWidgets.iterator();
                while (iterator.hasNext()) {
                    ShareWidget shareWidget = iterator.next();
                    String dateToken = generateShareToken(shareWidget.getViewId(), shareInfo.getSharedUserName(), shareInfo.getShareUser().getId());
                    shareWidget.setDataToken(dateToken);
                }
            }
            shareDashboard.setWidgets(shareWidgets);

        } catch (ServerException e) {
            return resultFail(user, request, null).message(e.getMessage());
        } catch (UnAuthorizedExecption e) {
            return resultFail(user, request, HttpCodeEnum.FORBIDDEN).message(e.getMessage());
        }
        return resultSuccess(user, request).payload(shareDashboard);
    }

    /**
     * 获取分享数据
     *
     * @param token
     * @param executeParam
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getShareData(String token, ViewExecuteParam executeParam, User user, HttpServletRequest request) {
        Paginate<Map<String, Object>> paginate = null;
        try {

            ShareInfo shareInfo = getShareInfo(token, user);
            if (null == shareInfo || shareInfo.getShareId().longValue() < 1L) {
                return resultFail(user, request, null).message("Invalid share token");
            }

            if (!StringUtils.isEmpty(shareInfo.getSharedUserName())) {
                if (!shareInfo.getSharedUserName().equals(user.getUsername())) {
                    resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
                }
            }

            Long viewId = shareInfo.getShareId();
            ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(viewId);
            paginate = viewService.getResultDataList(viewWithProjectAndSource, executeParam, shareInfo.getShareUser());
        } catch (ServerException e) {
            return resultFail(user, request, null).message(e.getMessage());
        } catch (UnAuthorizedExecption e) {
            return resultFail(user, request, HttpCodeEnum.FORBIDDEN).message(e.getMessage());
        }

        return resultSuccess(user, request).payload(paginate);
    }


    /**
     * 分享数据生成csv文件并下载
     *
     * @param token
     * @param executeParam
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap generationShareDataCsv(String token, ViewExecuteParam executeParam, User user, HttpServletRequest request) {
        String filePath = null;
        try {

            ShareInfo shareInfo = getShareInfo(token, user);
            if (null == shareInfo || shareInfo.getShareId().longValue() < 1L) {
                return resultFail(user, request, null).message("Invalid share token");
            }

            if (!StringUtils.isEmpty(shareInfo.getSharedUserName())) {
                if (!shareInfo.getSharedUserName().equals(user.getUsername())) {
                    resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
                }
            }

            Long viewId = shareInfo.getShareId();
            ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(viewId);

            if (!allowDownload(viewWithProjectAndSource.getProject(), shareInfo.getShareUser())) {
                resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
            }

            List<QueryColumn> columns = viewService.getResultMeta(viewWithProjectAndSource, executeParam, shareInfo.getShareUser());

            executeParam.setLimit(-1);
            executeParam.setPageSize(-1);
            executeParam.setPageNo(-1);
            Paginate<Map<String, Object>> paginate = viewService.getResultDataList(viewWithProjectAndSource, executeParam, shareInfo.getShareUser());

            if (null != columns && columns.size() > 0) {
                String csvPath = fileUtils.fileBasePath + File.separator + "csv";
                File file = new File(csvPath);
                if (!file.exists()) {
                    file.mkdirs();
                }
                SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                String csvName = viewWithProjectAndSource.getName() + "_" + sdf.format(new Date());
                String fileFullPath = CsvUtils.formatCsvWithFirstAsHeader(csvPath, csvName, columns, paginate.getResultList());
                filePath = fileFullPath.replace(fileUtils.fileBasePath, "");
            }
        } catch (ServerException e) {
            return resultFail(user, request, null).message(e.getMessage());
        } catch (UnAuthorizedExecption e) {
            return resultFail(user, request, HttpCodeEnum.FORBIDDEN).message(e.getMessage());
        }
        return resultSuccess(user, request).payload(getHost() + filePath);
    }

    /**
     * 获取分享distinct value
     *
     * @param token
     * @param viewId
     * @param param
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getDistinctValue(String token, Long viewId, DistinctParam param, User user, HttpServletRequest request) {
        List<Map<String, Object>> list = null;
        try {

            ShareInfo shareInfo = getShareInfo(token, user);
            if (null == shareInfo || shareInfo.getShareId().longValue() < 1L) {
                return resultFail(user, request, null).message("Invalid share token");
            }

            if (!StringUtils.isEmpty(shareInfo.getSharedUserName())) {
                if (!shareInfo.getSharedUserName().equals(user.getUsername())) {
                    resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
                }
            }

            ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(viewId);
            if (null == viewWithProjectAndSource) {
                log.info("view (:{}) not found", viewId);
                return resultFail(user, request, null).message("view not found");
            }

            Project project = viewWithProjectAndSource.getProject();
            if (null == project) {
                log.info("project not found");
                return resultFail(user, request, null).message("project not found");
            }

            if (!viewService.allowGetData(project, shareInfo.getShareUser())) {
                return resultFail(user, request, HttpCodeEnum.UNAUTHORIZED).message("ERROR Permission denied");
            }

            try {
                list = viewService.getDistinctValueData(viewWithProjectAndSource, param, shareInfo.getShareUser());
            } catch (ServerException e) {
                return resultFail(user, request, HttpCodeEnum.UNAUTHORIZED).message(e.getMessage());
            }
        } catch (ServerException e) {
            return resultFail(user, request, null).message(e.getMessage());
        } catch (UnAuthorizedExecption e) {
            return resultFail(user, request, HttpCodeEnum.FORBIDDEN).message(e.getMessage());
        }

        return resultSuccess(user, request).payloads(list);
    }


    /**
     * 生成分享token
     *
     * @param shareEntityId
     * @param username
     * @return
     * @throws ServerException
     */
    @Override
    public String generateShareToken(Long shareEntityId, String username, Long userId) throws ServerException {
        /**
         * username: share实体Id:-:分享人id[:-:被分享人用户名]
         * password: share实体Id[:-:被分享人Id]
         */
        TokenEntity shareToken = new TokenEntity();
        String tokenUserName = shareEntityId + Constants.SPLIT_CHAR_STRING + userId;
        String tokenPassword = shareEntityId + "";
        if (!StringUtils.isEmpty(username)) {
            User shareUser = userMapper.selectByUsername(username);
            if (null == shareUser) {
                throw new ServerException("user : \"" + username + "\" not found");
            }
            tokenUserName += Constants.SPLIT_CHAR_STRING + username;
            tokenPassword += (Constants.SPLIT_CHAR_STRING + shareUser.getId());
        }
        shareToken.setUsername(tokenUserName);
        shareToken.setPassword(tokenPassword);

        //生成token 并 aes加密
        return AESUtils.encrypt(tokenUtils.generateContinuousToken(shareToken), null);
    }

    /**
     * 获取分享实体id
     *
     * @param token
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     */
    private ShareInfo getShareInfo(String token, User user) throws ServerException, UnAuthorizedExecption {

        if (StringUtils.isEmpty(token)) {
            throw new ServerException("Invalid share token");
        }

        //AES解密
        String decrypt = AESUtils.decrypt(token, null);
        //获取分享信息
        String tokenUserName = tokenUtils.getUsername(decrypt);
        String tokenPassword = tokenUtils.getPassword(decrypt);

        String[] tokenInfos = tokenUserName.split(Constants.SPLIT_CHAR_STRING);
        String[] tokenCrypts = tokenPassword.split(Constants.SPLIT_CHAR_STRING);

        if (tokenInfos.length < 2) {
            throw new ServerException("Invalid share token");
        }

        Long shareUserId = Long.parseLong(tokenInfos[1]);
        if (shareUserId.longValue() < 1L) {
            throw new ServerException("Invalid share token");
        }

        User shareUser = userMapper.getById(shareUserId);
        if (null == shareUser) {
            throw new ServerException("Invalid share token");
        }

        String sharedUserName = null;
        if (tokenInfos.length == 3) {
            if (tokenCrypts.length < 2) {
                throw new ServerException("Invalid share token");
            }
            String username = tokenInfos[2];
            Long sharedUserId = Long.parseLong(tokenCrypts[1]);
            User sharedUser = userMapper.selectByUsername(username);
            if (null == sharedUser || !sharedUser.getId().equals(sharedUserId)) {
                throw new UnAuthorizedExecption("The resource requires authentication, which was not supplied with the request");
            }

            if (null == user || (!user.getId().equals(sharedUserId) && !user.getId().equals(shareUserId))) {
                throw new UnAuthorizedExecption("The resource requires authentication, which was not supplied with the request");
            }

            sharedUserName = username;
        }

        Long shareId1 = Long.parseLong(tokenInfos[0]);
        Long shareId2 = Long.parseLong(tokenCrypts[0]);

        if (shareId1.longValue() < 1L || shareId2.longValue() < 1L || !shareId1.equals(shareId2)) {
            throw new ServerException("Invalid share token");
        }

        return new ShareInfo(shareId1, shareUser, sharedUserName);
    }


    private ResultMap resultSuccess(User user, HttpServletRequest request) {
        if (null == user) {
            return new ResultMap().success();
        } else {
            return new ResultMap(tokenUtils).successAndRefreshToken(request);
        }
    }


    private ResultMap resultFail(User user, HttpServletRequest request, HttpCodeEnum httpCodeEnum) {
        if (null == user) {
            if (null != httpCodeEnum) {
                return new ResultMap().fail(httpCodeEnum.getCode());
            } else {
                return new ResultMap().fail();
            }
        } else {
            if (null != httpCodeEnum) {
                return new ResultMap(tokenUtils).failAndRefreshToken(request, httpCodeEnum);
            } else {
                return new ResultMap(tokenUtils).failAndRefreshToken(request);
            }
        }
    }
}

