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

package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ForbiddenExecption;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.model.Paginate;
import edp.core.utils.*;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ErrorMsg;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.model.TokenEntity;
import edp.davinci.dao.*;
import edp.davinci.dto.displayDto.MemDisplaySlideWidgetWithSlide;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.shareDto.*;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.viewDto.DistinctParam;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.viewDto.ViewWithProjectAndSource;
import edp.davinci.model.*;
import edp.davinci.service.ProjectService;
import edp.davinci.service.ShareService;
import edp.davinci.service.UserService;
import edp.davinci.service.ViewService;
import edp.davinci.service.share.ShareMode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.sql.SQLException;
import java.util.*;

import static edp.core.consts.Consts.EMPTY;


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
    private DisplaySlideMapper displaySlideMapper;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Autowired
    private ProjectService projectService;

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

    @Autowired
    private ServerUtils serverUtils;

    @Autowired
    private UserService userService;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private ProjectMapper projectMapper;

    @Override
    public User shareLogin(String token, UserLogin userLogin) throws NotFoundException, ServerException, UnAuthorizedExecption {
        //AES解密
        String decrypt = AESUtils.decrypt(token, null);
        //获取分享信息
        String tokenUserName = tokenUtils.getUsername(decrypt);
        String tokenPassword = tokenUtils.getPassword(decrypt);

        String[] tokenInfos = tokenUserName.split(Constants.SPLIT_CHAR_STRING);
        String[] tokenCrypts = tokenPassword.split(Constants.SPLIT_CHAR_STRING);

        if (tokenInfos.length < 2) {
            throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
        }

        User loginUser = userService.userLogin(userLogin);
        if (null == loginUser) {
            throw new NotFoundException("user is not found");
        }

        Long shareUserId = Long.parseLong(tokenInfos[1]);
        if (shareUserId.longValue() < 1L) {
            throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
        }

        User shareUser = userMapper.getById(shareUserId);
        if (null == shareUser) {
            throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
        }

        if (tokenInfos.length == 3) {
            if (tokenCrypts.length < 2) {
                throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
            }
            try {
                String sharedUserName = tokenInfos[2];
                Long sharedUserId = Long.parseLong(tokenCrypts[1]);
                if (!(loginUser.getUsername().equals(sharedUserName) && loginUser.getId().equals(sharedUserId)) && !loginUser.getId().equals(shareUserId)) {
                    throw new ForbiddenExecption(ErrorMsg.ERR_MSG_AUTHENTICATION);
                }
            } catch (NumberFormatException e) {
                throw new ForbiddenExecption(ErrorMsg.ERR_MSG_AUTHENTICATION);
            }
        }

        //是否激活
        if (!loginUser.getActive()) {
            throw new ServerException("this user is not active");
        }

        return loginUser;
    }

    /**
     * 获取分享widget
     *
     * @param token
     * @param user
     * @return
     */
    @Override
    public ShareWidget getShareWidget(String token, User user) throws NotFoundException, ServerException, ForbiddenExecption, UnAuthorizedExecption {

        ShareInfo shareInfo = getShareInfo(token, user);
        verifyShareUser(user, shareInfo);


        ShareWidget shareWidget = widgetMapper.getShareWidgetById(shareInfo.getShareId());

        if (null == shareWidget) {
            throw new NotFoundException("widget not found");
        }

        String dateToken = generateShareToken(shareWidget.getId(), shareInfo.getSharedUserName(), shareInfo.getShareUser().getId());
        shareWidget.setDataToken(dateToken);
        return shareWidget;
    }


    /**
     * 获取分享Display
     *
     * @param token
     * @param user
     * @return
     */
    @Override
    public ShareDisplay getShareDisplay(String token, User user) throws NotFoundException, ServerException, ForbiddenExecption, UnAuthorizedExecption {
        ShareInfo shareInfo = getShareInfo(token, user);
        verifyShareUser(user, shareInfo);

        Long displayId = shareInfo.getShareId();
        Display display = displayMapper.getById(displayId);
        if (null == display) {
            throw new ServerException("display is not found");
        }

        ShareDisplay shareDisplay = new ShareDisplay();

        BeanUtils.copyProperties(display, shareDisplay);

        List<MemDisplaySlideWidgetWithSlide> memWithSlides = memDisplaySlideWidgetMapper.getMemWithSlideByDisplayId(displayId);
        List<DisplaySlide> displaySlides = displaySlideMapper.selectByDisplayId(displayId);
        Set<MemDisplaySlideWidget> memDisplaySlideWidgetSet = null;

        if (!CollectionUtils.isEmpty(memWithSlides)) {
            memDisplaySlideWidgetSet = new HashSet<>();
            for (MemDisplaySlideWidgetWithSlide memWithSlide : memWithSlides) {
                MemDisplaySlideWidget memDisplaySlideWidget = new MemDisplaySlideWidget();
                BeanUtils.copyProperties(memWithSlide, memDisplaySlideWidget);
                memDisplaySlideWidgetSet.add(memDisplaySlideWidget);
            }
        }

        if (!CollectionUtils.isEmpty(displaySlides)) {
            Set<ShareDisplaySlide> shareDisplaySlideSet = new HashSet<>();
            for (DisplaySlide displaySlide : displaySlides) {
                ShareDisplaySlide shareDisplaySlide = new ShareDisplaySlide();
                BeanUtils.copyProperties(displaySlide, shareDisplaySlide);

                if (!CollectionUtils.isEmpty(memDisplaySlideWidgetSet)) {
                    Iterator<MemDisplaySlideWidget> memIterator = memDisplaySlideWidgetSet.iterator();
                    Set<MemDisplaySlideWidget> relations = new HashSet<>();
                    while (memIterator.hasNext()) {
                        MemDisplaySlideWidget memDisplaySlideWidget = memIterator.next();
                        if (memDisplaySlideWidget.getDisplaySlideId().equals(displaySlide.getId())) {
                            relations.add(memDisplaySlideWidget);
                        }
                    }
                    shareDisplaySlide.setRelations(relations);
                }
                shareDisplaySlideSet.add(shareDisplaySlide);
            }
            shareDisplay.setSlides(shareDisplaySlideSet);
        }

        Set<ShareWidget> shareWidgets = widgetMapper.getShareWidgetsByDisplayId(displayId);
        if (!CollectionUtils.isEmpty(shareWidgets)) {
            for (ShareWidget shareWidget : shareWidgets) {
                String dateToken = generateShareToken(shareWidget.getId(), shareInfo.getSharedUserName(), shareInfo.getShareUser().getId());
                shareWidget.setDataToken(dateToken);
            }
            shareDisplay.setWidgets(shareWidgets);
        }

        return shareDisplay;
    }

    /**
     * 获取分享dashboard
     *
     * @param token
     * @param user
     * @return
     */
    @Override
    public ShareDashboard getShareDashboard(String token, User user) throws NotFoundException, ServerException, ForbiddenExecption, UnAuthorizedExecption {
        ShareInfo shareInfo = getShareInfo(token, user);

        verifyShareUser(user, shareInfo);

        Long dashboardId = shareInfo.getShareId();
        Dashboard dashboard = dashboardMapper.getById(dashboardId);

        if (null == dashboard) {
            throw new NotFoundException("dashboard is not found");
        }

        ShareDashboard shareDashboard = new ShareDashboard();
        BeanUtils.copyProperties(dashboard, shareDashboard);

        List<MemDashboardWidget> memDashboardWidgets = memDashboardWidgetMapper.getByDashboardId(dashboardId);
        shareDashboard.setRelations(memDashboardWidgets);

        Set<ShareWidget> shareWidgets = widgetMapper.getShareWidgetsByDashboard(dashboardId);
        if (!CollectionUtils.isEmpty(shareWidgets)) {
            for (ShareWidget shareWidget : shareWidgets) {
                String dateToken = generateShareToken(shareWidget.getId(), shareInfo.getSharedUserName(), shareInfo.getShareUser().getId());
                shareWidget.setDataToken(dateToken);
            }
        }
        shareDashboard.setWidgets(shareWidgets);
        return shareDashboard;
    }


    /**
     * 获取分享数据
     *
     * @param token
     * @param executeParam
     * @param user
     * @return
     */
    @Override
    public Paginate<Map<String, Object>> getShareData(String token, ViewExecuteParam executeParam, User user)
            throws NotFoundException, ServerException, ForbiddenExecption, UnAuthorizedExecption, SQLException {
        ShareInfo shareInfo = getShareInfo(token, user);
        verifyShareUser(user, shareInfo);

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceByWidgetId(shareInfo.getShareId());

        ProjectDetail projectDetail = projectService.getProjectDetail(viewWithProjectAndSource.getProjectId(), shareInfo.getShareUser(), false);
        boolean maintainer = projectService.isMaintainer(projectDetail, shareInfo.getShareUser());

        Paginate paginate = viewService.getResultDataList(maintainer, viewWithProjectAndSource, executeParam, shareInfo.getShareUser());
        return paginate;
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
    public List<Map<String, Object>> getDistinctValue(String token, Long viewId, DistinctParam param, User user, HttpServletRequest request) {
        List<Map<String, Object>> list = null;
        ShareInfo shareInfo = getShareInfo(token, user);
        verifyShareUser(user, shareInfo);

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(viewId);
        if (null == viewWithProjectAndSource) {
            log.info("view (:{}) not found", viewId);
            throw new NotFoundException("view is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(viewWithProjectAndSource.getProjectId(), shareInfo.getShareUser(), false);

        if (!projectService.allowGetData(projectDetail, shareInfo.getShareUser())) {
            throw new UnAuthorizedExecption(ErrorMsg.ERR_MSG_PERMISSION);
        }

        try {
            boolean maintainer = projectService.isMaintainer(projectDetail, shareInfo.getShareUser());
            list = viewService.getDistinctValueData(maintainer, viewWithProjectAndSource, param, shareInfo.getShareUser());
        } catch (ServerException e) {
            throw new UnAuthorizedExecption(e.getMessage());
        }

        return list;
    }


    public void formatShareParam(Long projectId, ShareEntity entity) {
        if (entity.getMode() != ShareMode.AUTH) {
            return;
        }

        Set<Long> viewers = new HashSet<>();
        Set<Long> roleIds = new HashSet<>();

        if (!CollectionUtils.isEmpty(entity.getViewers())) {
            List<User> users = userMapper.getByIds(new ArrayList<>(entity.getViewers()));
            users.stream().map(User::getId).forEach(viewers::add);
        }

        if (!CollectionUtils.isEmpty(entity.getRoles())) {
            Project project = projectMapper.getById(projectId);
            List<Role> roles = roleMapper.selectByIdsAndOrgId(project.getOrgId(), new ArrayList<>(entity.getRoles()));
            roles.stream().map(Role::getId).forEach(roleIds::add);
        }

        entity.setViewers(viewers);
        entity.setRoles(roleIds);
    }

    /**
     * 获取分享实体id
     * 已废弃，仅供版本兼容
     *
     * @param token
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedExecption
     */
    @Deprecated
    public ShareInfo getShareInfo(String token, User user) throws ServerException, ForbiddenExecption {

        if (StringUtils.isEmpty(token)) {
            throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
        }

        //AES解密
        String decrypt = AESUtils.decrypt(token, null);
        //获取分享信息
        String tokenUserName = tokenUtils.getUsername(decrypt);
        String tokenPassword = tokenUtils.getPassword(decrypt);

        String[] tokenInfos = tokenUserName.split(Constants.SPLIT_CHAR_STRING);
        String[] tokenCrypts = tokenPassword.split(Constants.SPLIT_CHAR_STRING);

        if (tokenInfos.length < 2) {
            throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
        }

        Long shareUserId = Long.parseLong(tokenInfos[1]);
        if (shareUserId.longValue() < 1L) {
            throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
        }

        User shareUser = userMapper.getById(shareUserId);
        if (null == shareUser) {
            throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
        }

        String sharedUserName = null;
        if (tokenInfos.length == 3) {
            if (tokenCrypts.length < 2) {
                throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
            }
            String username = tokenInfos[2];
            Long sharedUserId = Long.parseLong(tokenCrypts[1]);
            User sharedUser = userMapper.selectByUsername(username);
            if (null == sharedUser || !sharedUser.getId().equals(sharedUserId)) {
                throw new ForbiddenExecption(ErrorMsg.ERR_MSG_AUTHENTICATION);
            }

            if (null == user || (!user.getId().equals(sharedUserId) && !user.getId().equals(shareUserId))) {
                throw new ForbiddenExecption(ErrorMsg.ERR_MSG_AUTHENTICATION);
            }

            sharedUserName = username;
        }

        Long shareId1 = Long.parseLong(tokenInfos[0]);
        Long shareId2 = Long.parseLong(tokenCrypts[0]);

        if (shareId1.longValue() < 1L || shareId2.longValue() < 1L || !shareId1.equals(shareId2)) {
            throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
        }

        return new ShareInfo(shareId1, shareUser, sharedUserName);
    }


    /**
     * 验证分享信息
     * 已废弃，仅供版本兼容
     *
     * @param user
     * @param shareInfo
     * @throws ServerException
     * @throws ForbiddenExecption
     */
    @Deprecated
    public void verifyShareUser(User user, ShareInfo shareInfo) throws ServerException, ForbiddenExecption {
        if (null == shareInfo || shareInfo.getShareId().longValue() < 1L) {
            throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
        }

        if (!StringUtils.isEmpty(shareInfo.getSharedUserName())) {
            User tokenUser = userMapper.selectByUsername(shareInfo.getSharedUserName());
            if (tokenUser == null || !tokenUser.getId().equals(user.getId())) {
                throw new ForbiddenExecption(ErrorMsg.ERR_MSG_PERMISSION);
            }
        }
    }

    /**
     * 生成分享token
     * 已废弃，仅供版本兼容
     *
     * @param shareEntityId
     * @param username
     * @return
     * @throws ServerException
     */
    @Override
    @Deprecated
    public String generateShareToken(Long shareEntityId, String username, Long userId) throws ServerException {
        /**
         * username: share实体Id:-:分享人id[:-:被分享人用户名]
         * password: share实体Id[:-:被分享人Id]
         */
        TokenEntity shareToken = new TokenEntity();
        String tokenUserName = shareEntityId + Constants.SPLIT_CHAR_STRING + userId;
        String tokenPassword = shareEntityId + EMPTY;
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
}

