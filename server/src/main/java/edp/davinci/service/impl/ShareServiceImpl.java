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
import edp.core.model.QueryColumn;
import edp.core.utils.AESUtils;
import edp.core.utils.FileUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.model.TokenEntity;
import edp.davinci.core.utils.CsvUtils;
import edp.davinci.dao.*;
import edp.davinci.dto.displayDto.MemDisplaySlideWidgetWithSlide;
import edp.davinci.dto.shareDto.ShareDashboard;
import edp.davinci.dto.shareDto.ShareDisplay;
import edp.davinci.dto.shareDto.ShareDisplaySlide;
import edp.davinci.dto.shareDto.ShareWidget;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.userDto.UserLoginResult;
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
public class ShareServiceImpl implements ShareService {

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

    private final String shareUserName = "shareUserName";

    private final String shareId = "shareId";


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

        User user = userMapper.selectByUsername(userLogin.getUsername());
        if (null == user) {
            return new ResultMap().fail().message("user not found").payload("username or password invalid");
        }

        //校验密码
        if (!BCrypt.checkpw(userLogin.getPassword(), user.getPassword())) {
            return new ResultMap().fail().message("password is wrong").payload("username or password invalid");
        }

        if (tokenInfos.length == 3) {
            if (tokenCrypts.length < 2) {
                throw new ServerException("Invalid share token");
            }
            try {
                String shareUserName = tokenInfos[2];
                Long shareUserId = Long.parseLong(tokenCrypts[1]);
                if (!user.getUsername().equals(shareUserName) || !user.getId().equals(shareUserId)) {
                    return new ResultMap().fail().message("Invalid token username");
                }
            } catch (NumberFormatException e) {
                return new ResultMap().fail().message("Invalid token username");
            }
        }

        //是否激活
        if (!user.getActive()) {
            return new ResultMap().failWithToken(tokenUtils.generateToken(user)).message("this user is not active");
        }

        UserLoginResult userLoginResult = new UserLoginResult();
        BeanUtils.copyProperties(user, userLoginResult);
        return new ResultMap().success(tokenUtils.generateToken(user)).payload(userLoginResult);
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
            Map<String, Object> shareInfo = getShareInfo(token, user);
            if (null == shareInfo || !shareInfo.containsKey(shareId)) {
                return resultFail(user, request, null).message("Invalid share token");
            }

            String useranme = null;
            if (shareInfo.containsKey(shareUserName)) {
                useranme = (String) shareInfo.get(shareUserName);
                if (!useranme.endsWith(user.getUsername())) {
                    resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
                }
            }
            Long widgetId = (Long) shareInfo.get(shareId);
            Widget widget = widgetMapper.getById(widgetId);

            if (null == widget) {
                return resultFail(user, request, null).message("widget not found");
            }

            String dateToken = generateShareToken(widget.getViewId(), useranme, null == user ? 0L : user.getId());
            shareWidget = new ShareWidget();
            BeanUtils.copyProperties(widget, shareWidget);
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
            Map<String, Object> shareInfo = getShareInfo(token, user);

            if (null == shareInfo || !shareInfo.containsKey(shareId)) {
                return resultFail(user, request, null).message("Invalid share token");
            }

            Long displayId = (Long) shareInfo.get(shareId);
            Display display = displayMapper.getById(displayId);

            String useranme = null;
            if (shareInfo.containsKey(shareUserName)) {
                useranme = (String) shareInfo.get(shareUserName);
                if (!useranme.endsWith(user.getUsername())) {
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

            Set<Widget> widgetSet = widgetMapper.getByDisplayId(displayId);
            Set<ShareWidget> shareWidgets = new HashSet<>();
            if (null != widgetSet && widgetSet.size() > 0) {
                Iterator<Widget> widgetIterator = widgetSet.iterator();
                while (widgetIterator.hasNext()) {
                    ShareWidget shareWidget = new ShareWidget();
                    Widget widget = widgetIterator.next();
                    String dateToken = generateShareToken(widget.getViewId(), useranme, null == user ? 0L : user.getId());
                    BeanUtils.copyProperties(widget, shareWidget);
                    shareWidget.setDataToken(dateToken);
                    shareWidgets.add(shareWidget);
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
            Map<String, Object> shareInfo = getShareInfo(token, user);
            if (null == shareInfo || !shareInfo.containsKey(shareId)) {
                return resultFail(user, request, null).message("Invalid share token");
            }

            String useranme = null;
            if (shareInfo.containsKey(shareUserName)) {
                useranme = (String) shareInfo.get(shareUserName);
                if (!useranme.endsWith(user.getUsername())) {
                    resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
                }
            }
            Long dashboardId = (Long) shareInfo.get(shareId);
            Dashboard dashboard = dashboardMapper.getById(dashboardId);

            if (null == dashboard) {
                return resultFail(user, request, null).message("dashboard not found");
            }

            shareDashboard = new ShareDashboard();
            BeanUtils.copyProperties(dashboard, shareDashboard);

            List<MemDashboardWidget> memDashboardWidgets = memDashboardWidgetMapper.getByDashboardId(dashboardId);
            shareDashboard.setRelations(memDashboardWidgets);

            Set<ShareWidget> shareWidgets = null;

            Set<Widget> widgets = widgetMapper.getByDashboard(dashboardId);
            if (null != widgets && widgets.size() > 0) {
                shareWidgets = new HashSet<>();
                for (Widget widget : widgets) {
                    ShareWidget shareWidget = new ShareWidget();
                    BeanUtils.copyProperties(widget, shareWidget);
                    String dateToken = generateShareToken(widget.getViewId(), useranme, null == user ? 0L : user.getId());
                    shareWidget.setDataToken(dateToken);
                    shareWidgets.add(shareWidget);
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
        List<Map<String, Object>> list = null;
        try {
            Map<String, Object> shareInfo = getShareInfo(token, user);
            if (null != shareInfo && shareInfo.containsKey(shareId)) {
                if (shareInfo.containsKey(shareUserName)) {
                    String useranme = (String) shareInfo.get(shareUserName);
                    if (!useranme.endsWith(user.getUsername())) {
                        resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
                    }
                }
                Long viewId = (Long) shareInfo.get(shareId);

                ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(viewId);

                list = viewService.getResultDataList(viewWithProjectAndSource, executeParam, user);
            }
        } catch (ServerException e) {
            return resultFail(user, request, null).message(e.getMessage());
        } catch (UnAuthorizedExecption e) {
            return resultFail(user, request, HttpCodeEnum.FORBIDDEN).message(e.getMessage());
        }

        return resultSuccess(user, request).payloads(list);
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
            Map<String, Object> shareInfo = getShareInfo(token, user);
            if (null != shareInfo && shareInfo.containsKey(shareId)) {
                if (shareInfo.containsKey(shareUserName)) {
                    String useranme = (String) shareInfo.get(shareUserName);
                    if (!useranme.endsWith(user.getUsername())) {
                        resultFail(user, request, HttpCodeEnum.FORBIDDEN).message("ERROR Permission denied");
                    }
                }
                Long viewId = (Long) shareInfo.get(shareId);

                ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(viewId);

                List<QueryColumn> columns = viewService.getResultMeta(viewWithProjectAndSource, executeParam, user);

                List<Map<String, Object>> dataList = viewService.getResultDataList(viewWithProjectAndSource, executeParam, user);

                if (null != columns && columns.size() > 0) {
                    String csvPath = fileUtils.fileBasePath + File.separator + "csv";
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
                    String csvName = viewWithProjectAndSource.getName() + "_" + sdf.format(new Date());
                    String fileFullPath = CsvUtils.formatCsvWithFirstAsHeader(csvPath, csvName, columns, dataList);
                    filePath = fileFullPath.replace(fileUtils.fileBasePath, "");
                }
            }
        } catch (ServerException e) {
            return resultFail(user, request, null).message(e.getMessage());
        } catch (UnAuthorizedExecption e) {
            return resultFail(user, request, HttpCodeEnum.FORBIDDEN).message(e.getMessage());
        }
        return resultSuccess(user, request).payload(filePath);
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
                throw new ServerException("user : " + username + " not found");
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
    private Map<String, Object> getShareInfo(String token, User user) throws ServerException, UnAuthorizedExecption {

        Map<String, Object> map = new HashMap<>();

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

        if (tokenInfos.length == 3) {
            if (tokenCrypts.length < 2) {
                throw new ServerException("Invalid share token");
            }
            String username = tokenInfos[2];
            Long userId = Long.parseLong(tokenCrypts[1]);
            User tokenUser = userMapper.selectByUsername(username);
            if (null == tokenUser || !tokenUser.getId().equals(userId)) {
                throw new UnAuthorizedExecption("The resource requires authentication, which was not supplied with the request");
            }

            if (null == user || !user.getId().equals(tokenUser.getId())) {
                throw new UnAuthorizedExecption("The resource requires authentication, which was not supplied with the request");
            }

            map.put(shareUserName, username);
        }

        Long shareId1 = Long.parseLong(tokenInfos[0]);
        Long shareId2 = Long.parseLong(tokenCrypts[0]);

        if (!shareId1.equals(shareId2)) {
            throw new ServerException("Invalid share token");
        }

        map.put(shareId, shareId1);
        return map;
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
