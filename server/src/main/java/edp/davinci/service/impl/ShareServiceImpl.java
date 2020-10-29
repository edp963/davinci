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
import com.alibaba.fastjson.JSON;
import edp.core.exception.ForbiddenException;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedException;
import edp.core.model.Paginate;
import edp.core.utils.AESUtils;
import edp.core.utils.CollectionUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ErrorMsg;
import edp.davinci.core.model.TokenEntity;
import edp.davinci.dao.*;
import edp.davinci.dto.displayDto.MemDisplaySlideWidgetWithSlide;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.dto.shareDto.*;
import edp.davinci.dto.userDto.UserLogin;
import edp.davinci.dto.viewDto.DistinctParam;
import edp.davinci.dto.viewDto.SimpleView;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.viewDto.ViewWithProjectAndSource;
import edp.davinci.model.*;
import edp.davinci.service.ProjectService;
import edp.davinci.service.ShareService;
import edp.davinci.service.UserService;
import edp.davinci.service.ViewService;
import edp.davinci.service.share.ShareDataPermission;
import edp.davinci.service.share.ShareFactor;
import edp.davinci.service.share.ShareMode;
import edp.davinci.dto.shareDto.SimpleShareWidget;
import edp.davinci.service.share.aspect.ShareAuthAspect;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

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
    private DisplaySlideMapper displaySlideMapper;

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
    private UserService userService;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private RelRoleUserMapper relRoleUserMapper;

    @Autowired
    private String TOKEN_SECRET;

    @Override
    public User shareLogin(UserLogin userLogin) throws NotFoundException, ServerException, UnAuthorizedException {
        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        User loginUser = userService.userLogin(userLogin);
        if (null == loginUser) {
            throw new NotFoundException("user is not found");
        }

        if (!shareFactor.getViewers().contains(loginUser.getId())) {
            Set<RelRoleUser> relRoleUsers = relRoleUserMapper.selectByUserAndRoles(loginUser.getId(), shareFactor.getRoles());
            if (CollectionUtils.isEmpty(relRoleUsers)) {
                throw new ForbiddenException(ErrorMsg.ERR_MSG_PERMISSION);
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
     * @param user
     * @return
     */
    @Override
    public ShareWidget getShareWidget(User user) throws NotFoundException, ServerException, ForbiddenException, UnAuthorizedException {

        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        ShareFactor widgetFactor = new ShareFactor();
        BeanUtils.copyProperties(shareFactor, widgetFactor);
        ShareFactor viewFactor = new ShareFactor();
        BeanUtils.copyProperties(shareFactor, viewFactor);

        Widget widget = (Widget) shareFactor.getShareEntity();
        SimpleShareWidget simpleShareWidget = widgetMapper.getShareWidgetById(widget.getId());

        if (null == simpleShareWidget) {
            throw new NotFoundException("Widget is not found");
        }

        widgetFactor.freshWidgetDataToken(simpleShareWidget, TOKEN_SECRET);

        // widget controller views
        Set<SimpleView> simpleViews = new HashSet<>();
        Map<String, Object> widgetConfigMap = JSON.parseObject(simpleShareWidget.getConfig(), Map.class);
        if (!CollectionUtils.isEmpty(widgetConfigMap)) {
            setControllerViews(simpleViews, (List<Map<String, Object>>)widgetConfigMap.get("controls"));
        }

        simpleViews.add(viewMapper.getSimpleViewById(simpleShareWidget.getViewId()));

        ShareWidget shareWidget = new ShareWidget();
        shareWidget.setWidget(simpleShareWidget);
        shareWidget.setViews(generateShareViews(simpleViews, viewFactor));

        return shareWidget;
    }


    /**
     * 获取分享Display
     *
     * @param user
     * @return
     */
    @Override
    public ShareDisplay getShareDisplay(User user) throws NotFoundException, ServerException, ForbiddenException, UnAuthorizedException {

        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        ShareFactor widgetFactor = new ShareFactor();
        BeanUtils.copyProperties(shareFactor, widgetFactor);
        ShareFactor viewFactor = new ShareFactor();
        BeanUtils.copyProperties(shareFactor, viewFactor);

        Display display = (Display) shareFactor.getShareEntity();
        ShareDisplay shareDisplay = new ShareDisplay();
        BeanUtils.copyProperties(display, shareDisplay);

        List<MemDisplaySlideWidgetWithSlide> memWithSlides = memDisplaySlideWidgetMapper.getMemWithSlideByDisplayId(display.getId());
        List<DisplaySlide> displaySlides = displaySlideMapper.selectByDisplayId(display.getId());
        Set<MemDisplaySlideWidget> memDisplaySlideWidgetSet = new HashSet<>();

        for (MemDisplaySlideWidgetWithSlide memWithSlide : memWithSlides) {
            MemDisplaySlideWidget memDisplaySlideWidget = new MemDisplaySlideWidget();
            BeanUtils.copyProperties(memWithSlide, memDisplaySlideWidget);
            memDisplaySlideWidgetSet.add(memDisplaySlideWidget);
        }

        Set<ShareDisplaySlide> shareDisplaySlideSet = new HashSet<>();
        for (DisplaySlide displaySlide : displaySlides) {
            ShareDisplaySlide shareDisplaySlide = new ShareDisplaySlide();
            BeanUtils.copyProperties(displaySlide, shareDisplaySlide);

            Set<MemDisplaySlideWidget> relations = new HashSet<>();
            relations.addAll(memDisplaySlideWidgetSet.stream().filter(mw -> mw.getDisplaySlideId().equals(displaySlide.getId())).collect(Collectors.toSet()));
            shareDisplaySlide.setRelations(relations);
            shareDisplaySlideSet.add(shareDisplaySlide);
        }
        shareDisplay.setSlides(shareDisplaySlideSet);

        Set<SimpleShareWidget> widgets = widgetMapper.getShareWidgetsByDisplayId(display.getId());
        Set<SimpleView> simpleViews = CollectionUtils.isEmpty(widgets) ? new HashSet<>() : viewMapper.selectSimpleByWidgetIds(widgets.stream().map(w -> w.getId()).collect(Collectors.toSet()));
        widgets.forEach(w -> {
            widgetFactor.freshWidgetDataToken(w, TOKEN_SECRET);
            Map<String, Object> widgetConfigMap = JSON.parseObject(widgetMapper.getShareWidgetById(w.getId()).getConfig(), Map.class);
            if (!CollectionUtils.isEmpty(widgetConfigMap)) {
                setControllerViews(simpleViews, (List<Map<String, Object>>) widgetConfigMap.get("controls"));
            }
        });
        shareDisplay.setWidgets(widgets);
        shareDisplay.setViews(generateShareViews(simpleViews, viewFactor));

        return shareDisplay;
    }

    /**
     * 获取分享dashboard
     *
     * @param user
     * @return
     */
    @Override
    @Transactional
    public ShareDashboard getShareDashboard(User user) throws NotFoundException, ServerException, ForbiddenException, UnAuthorizedException {

        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        ShareFactor widgetFactor = new ShareFactor();
        BeanUtils.copyProperties(shareFactor, widgetFactor);
        ShareFactor viewFactor = new ShareFactor();
        BeanUtils.copyProperties(shareFactor, viewFactor);

        Dashboard dashboard = (Dashboard) shareFactor.getShareEntity();
        ShareDashboard shareDashboard = new ShareDashboard();
        BeanUtils.copyProperties(dashboard, shareDashboard);

        List<MemDashboardWidget> memDashboardWidgets = memDashboardWidgetMapper.getByDashboardId(dashboard.getId());
        shareDashboard.setRelations(memDashboardWidgets);

        Set<SimpleShareWidget> simpleShareWidgets = widgetMapper.getShareWidgetsByDashboard(dashboard.getId());
        if (!CollectionUtils.isEmpty(simpleShareWidgets)) {
            simpleShareWidgets.forEach(shareWidget -> widgetFactor.freshWidgetDataToken(shareWidget, TOKEN_SECRET));
        }
        shareDashboard.setWidgets(simpleShareWidgets);

        Set<Long> widgetIds = memDashboardWidgets.stream().map(MemDashboardWidget::getWidgetId).collect(Collectors.toSet());
        Set<SimpleView> simpleViews = CollectionUtils.isEmpty(widgetIds) ? new HashSet<>() : viewMapper.selectSimpleByWidgetIds(widgetIds);

        // global controller views
        Map<String, Object> dashboardConfig = JSON.parseObject(dashboard.getConfig(), Map.class);
        if (!CollectionUtils.isEmpty(dashboardConfig)) {
            setControllerViews(simpleViews, (List<Map<String, Object>>) dashboardConfig.get("filters"));
        }

        // widget controller views
        memDashboardWidgets.forEach(mw -> {
            Map<String, Object> widgetConfigMap = JSON.parseObject(widgetMapper.getShareWidgetById(mw.getWidgetId()).getConfig(), Map.class);
            if (!CollectionUtils.isEmpty(widgetConfigMap)) {
                setControllerViews(simpleViews, (List<Map<String, Object>>)widgetConfigMap.get("controls"));
            }
        });

        shareDashboard.setViews(generateShareViews(simpleViews, viewFactor));

        return shareDashboard;
    }

    private void setControllerViews(Set<SimpleView> simpleViews, List<Map<String, Object>> list) {
        if (!CollectionUtils.isEmpty(list)) {
            list.stream().filter(m -> m.containsKey("valueViewId")).collect(Collectors.toList()).forEach(m -> {
                simpleViews.add(viewMapper.getSimpleViewById(Long.parseLong(String.valueOf(m.get("valueViewId")))));
            });
        }
    }

    private Set<ShareView> generateShareViews(Set<SimpleView> simpleViews, ShareFactor viewFactor) {
        Set<ShareView> shareViews = new HashSet<>();
        simpleViews.forEach(v -> {
            ShareView view = new ShareView();
            BeanUtils.copyProperties(v, view);
            viewFactor.freshViewDataToken(view, TOKEN_SECRET);
            shareViews.add(view);
        });
        return shareViews;
    }

    /**
     * 获取分享数据
     *
     * @param executeParam
     * @param currentUser
     * @return
     */
    @Override
    public Paginate<Map<String, Object>> getShareData(ViewExecuteParam executeParam, User currentUser)
            throws NotFoundException, ServerException, ForbiddenException, UnAuthorizedException, SQLException {

        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        Widget widget = (Widget) shareFactor.getShareEntity();
        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceByWidgetId(widget.getId());

        User user;
        if (shareFactor.getPermission() == ShareDataPermission.SHARER) {
            user = shareFactor.getUser();
        } else {
            user = currentUser;
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(viewWithProjectAndSource.getProjectId(), user, false);
        boolean maintainer = projectService.isMaintainer(projectDetail, user);

        Paginate paginate = viewService.getResultDataList(maintainer, viewWithProjectAndSource, executeParam, user);
        return paginate;
    }

    /**
     * 获取分享控制器数据
     *
     * @param param
     * @param currentUser
     * @return
     */
    @Override
    public List<Map<String, Object>> getDistinctValue(DistinctParam param, User currentUser) {
        List<Map<String, Object>> list =  new ArrayList<>();
        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        View view = (View) shareFactor.getShareEntity();

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(view.getId());
        if (null == viewWithProjectAndSource) {
            throw new NotFoundException("View is not found");
        }

        User user;
        if (shareFactor.getPermission() == ShareDataPermission.SHARER) {
            user = shareFactor.getUser();
        } else {
            user = currentUser;
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(viewWithProjectAndSource.getProjectId(), user, false);
        boolean maintainer = projectService.isMaintainer(projectDetail, user);

        if (!projectService.allowGetData(projectDetail, user)) {
            throw new UnAuthorizedException(ErrorMsg.ERR_MSG_PERMISSION);
        }

        try {
            list = viewService.getDistinctValueData(maintainer, viewWithProjectAndSource, param, user);
        } catch (ServerException e) {
            throw new UnAuthorizedException(e.getMessage());
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
     * 获取登录用户权限
     *
     * @return
     * @throws ServerException
     * @throws ForbiddenException
     */
    @Override
    public Map<String, Object> getSharePermissions() throws ServerException, ForbiddenException {
        Map<String, Object> map = new HashMap<>(1);
        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        ProjectDetail projectDetail = shareFactor.getProjectDetail();
        if (projectDetail == null) {
            map.put("download", false);
            return map;
        }
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, shareFactor.getUser());
        if (projectPermission == null) {
            map.put("download", false);
            return map;
        }
        map.put("download", projectPermission.getDownloadPermission());
        return map;
    }

    /**
     * 前置接口：获取分享模式
     *
     * @return
     * @throws ServerException
     * @throws ForbiddenException
     */
    @Override
    public Map<String, Object> checkShareToken() throws ServerException, ForbiddenException {
        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        Map<String, Object> map = new HashMap<>(1);
        map.put("type", shareFactor.getMode().name());
        switch (shareFactor.getType()) {
            case WIDGET:
            case DASHBOARD:
            case DISPLAY:
                map.put("vizType", shareFactor.getType().name().toLowerCase());
                break;
            default:
                break;
        }
        return map;
    }

    /**
     * 获取分享实体id
     * 已废弃，仅供版本兼容
     *
     * @param token
     * @param user
     * @return
     * @throws ServerException
     * @throws UnAuthorizedException
     */
    @Deprecated
    public ShareInfo getShareInfo(String token, User user) throws ServerException, ForbiddenException {

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
                throw new ForbiddenException(ErrorMsg.ERR_MSG_AUTHENTICATION);
            }

            if (null == user || (!user.getId().equals(sharedUserId) && !user.getId().equals(shareUserId))) {
                throw new ForbiddenException(ErrorMsg.ERR_MSG_AUTHENTICATION);
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
     * @throws ForbiddenException
     */
    @Deprecated
    public void verifyShareUser(User user, ShareInfo shareInfo) throws ServerException, ForbiddenException {
        if (null == shareInfo || shareInfo.getShareId().longValue() < 1L) {
            throw new ServerException(ErrorMsg.ERR_INVALID_TOKEN);
        }

        if (!StringUtils.isEmpty(shareInfo.getSharedUserName())) {
            User tokenUser = userMapper.selectByUsername(shareInfo.getSharedUserName());
            if (tokenUser == null || !tokenUser.getId().equals(user.getId())) {
                throw new ForbiddenException(ErrorMsg.ERR_MSG_PERMISSION);
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

        //生成token并aes加密
        return AESUtils.encrypt(tokenUtils.generateContinuousToken(shareToken), null);
    }
}