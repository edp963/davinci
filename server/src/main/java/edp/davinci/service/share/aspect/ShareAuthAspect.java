/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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
 */

package edp.davinci.service.share.aspect;

import com.alibaba.druid.util.StringUtils;
import edp.core.annotation.AuthShare;
import edp.core.exception.ForbiddenException;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedException;
import edp.core.utils.CollectionUtils;
import edp.davinci.core.common.ErrorMsg;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.dao.DashboardPortalMapper;
import edp.davinci.dao.RelRoleUserMapper;
import edp.davinci.dao.UserMapper;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.shareDto.ShareInfo;
import edp.davinci.model.*;
import edp.davinci.service.ProjectService;
import edp.davinci.service.ShareService;
import edp.davinci.service.impl.DashboardServiceImpl;
import edp.davinci.service.impl.DisplayServiceImpl;
import edp.davinci.service.impl.WidgetServiceImpl;
import edp.davinci.service.share.*;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@Aspect
@Slf4j
public class ShareAuthAspect {

    @Autowired
    private String TOKEN_SECRET;

    @Autowired
    private ShareService shareService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RelRoleUserMapper relRoleUserMapper;

    @Autowired
    private WidgetServiceImpl widgetService;

    @Autowired
    private DashboardServiceImpl dashboardService;

    @Autowired
    private DashboardPortalMapper dashboardPortalMapper;

    @Autowired
    private DisplayServiceImpl displayService;

    @Autowired
    private ProjectService projectService;

    @Pointcut("@annotation(edp.core.annotation.AuthShare)")
    public void shareAuth() {
    }

    public static final ThreadLocal<ShareFactor> SHARE_FACTOR_THREAD_LOCAL = new ThreadLocal<>();

    @Around(value = "shareAuth()")

    @Transactional
    public ResponseEntity doAround(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        AuthShare authShare = signature.getMethod().getAnnotation(AuthShare.class);
        ShareType shareType = authShare.type();
        ShareOperation shareOperation = authShare.operation();

        Object[] args = joinPoint.getArgs();
        String token = (String) args[0];
        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().fail().message(ErrorMsg.ERR_INVALID_TOKEN);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        ShareFactor shareFactor = ShareFactor.parseShareFactor(token, TOKEN_SECRET);
        if (shareFactor.getType() == null) {
            shareFactor.setType(shareType);
        }

        User user = null;
        for (Object arg : args) {
            if (arg instanceof User) {
                user = (User) arg;
                if (user.getId() == null || user.getId() < 1L) {
                    user = null;
                }
            }
        }

        try {
            // 兼容老版本，token信息转换为新版本信息
            adaptShareInfo(token, shareFactor, user);
            // 下载接口数据参数语义不唯一，在业务中判断
            if (ShareOperation.DOWNLOAD != shareOperation) {
                if (ShareOperation.PERMISSION == shareOperation) {
                    // 获取兼容模式下的分享类型
                    String type = (String) args[2];
                    if (CheckEntityEnum.WIDGET.getSource().equals(type.toLowerCase())) {
                        shareFactor.setType(ShareType.WIDGET);
                    } else if (CheckEntityEnum.DASHBOARD.getSource().equals(type.toLowerCase())) {
                        shareFactor.setType(ShareType.DASHBOARD);
                    } else if (CheckEntityEnum.DISPLAY.getSource().equals(type.toLowerCase())) {
                        shareFactor.setType(ShareType.DISPLAY);
                    } else {
                        throw new ServerException("Unknown share type");
                    }
                } else {
                    shareFactor.setType(shareType == ShareType.DATA ? ShareType.WIDGET : shareType);
                }
            }

            if (shareType != ShareType.LOGIN) {
                // 校验token权限
                verifyToken(shareOperation, shareFactor, user, args);
                // 校验数据权限
                verifyDataPermission(shareOperation, shareType, shareFactor, user);
            }

            // thread local share factor
            SHARE_FACTOR_THREAD_LOCAL.set(shareFactor);
            // 处理业务并返回
            return (ResponseEntity) joinPoint.proceed(args);
        } finally {
            // clean thread local
            SHARE_FACTOR_THREAD_LOCAL.remove();
        }
    }

    /**
     * 校验Token 是否合法
     *
     * @param operation
     * @param shareFactor
     * @param user
     * @param args
     * @throws ForbiddenException
     */
    private void verifyToken(ShareOperation operation, ShareFactor shareFactor, User user, Object[] args)
            throws ForbiddenException, UnAuthorizedException {
        switch (shareFactor.getMode()) {
            case PASSWORD:
                String password = (String) args[1];
                if (StringUtils.isEmpty(password)) {
                    throw new UnAuthorizedException(operation == ShareOperation.LOAD_DATA ? ErrorMsg.ERR_LOAD_DATA_TOKEN : ErrorMsg.ERR_EMPTY_SHARE_PASSWORD);
                }
                if (!password.equals(shareFactor.getPassword())) {
                    throw new ForbiddenException(operation == ShareOperation.LOAD_DATA ? ErrorMsg.ERR_LOAD_DATA_TOKEN : ErrorMsg.ERR_INVALID_SHARE_PASSWORD);
                }
                break;
            case AUTH:
                if (user == null) {
                    throw new UnAuthorizedException(ErrorMsg.ERR_MSG_AUTHENTICATION);
                }
                if (!shareFactor.getViewers().contains(user.getId())) {
                    Set<RelRoleUser> relRoleUsers = relRoleUserMapper.selectByUserAndRoles(user.getId(), shareFactor.getRoles());
                    if (CollectionUtils.isEmpty(relRoleUsers)) {
                        throw new ForbiddenException(ErrorMsg.ERR_MSG_PERMISSION);
                    }
                }
                break;
            default:
                break;
        }
    }


    /**
     * 校验数据权限
     *
     * @param shareOperation
     * @param shareType
     * @param shareFactor
     * @param viewer
     */
    @Transactional
    protected void verifyDataPermission(ShareOperation shareOperation, ShareType shareType, ShareFactor shareFactor, User viewer)
            throws NotFoundException, ServerException, ForbiddenException, UnAuthorizedException {
        User sharer = userMapper.getById(shareFactor.getSharerId());
        if (sharer == null) {
            throw new ForbiddenException(ErrorMsg.ERR_INVALID_SHARER);
        }
        User user = shareFactor.getPermission() == ShareDataPermission.SHARER ? sharer : viewer;
        shareFactor.setUser(user);
        if (shareOperation == ShareOperation.READ || shareOperation == ShareOperation.PERMISSION) {
            parseEntityAndProject(shareFactor, user);
        } else if (shareOperation == ShareOperation.LOAD_DATA) {
            if (shareFactor.getType() != ShareType.WIDGET) {
                throw new ForbiddenException(ErrorMsg.ERR_LOAD_DATA_TOKEN);
            }
            Widget widget = widgetService.getWidget(shareFactor.getEntityId(), user);
            ProjectDetail projectDetail = projectService.getProjectDetail(widget.getProjectId(), user, false);
            if (!projectService.allowGetData(projectDetail, user)) {
                throw new UnAuthorizedException(ErrorMsg.ERR_MSG_PERMISSION);
            }
            shareFactor.setShareEntity(widget);
        } else {
            // 下载权限数据权限在业务中判断
            if (shareType != ShareType.DATA) {
                parseEntityAndProject(shareFactor, user);
            }
            return;
        }
    }

    private void parseEntityAndProject(ShareFactor shareFactor, User user) {

        switch (shareFactor.getType()) {
            case RECORD:
            case FILE:
            case WIDGET:
                Widget widget = widgetService.getWidget(shareFactor.getEntityId(), user);
                shareFactor.setProjectDetail(projectService.getProjectDetail(widget.getProjectId(), user, false));
                shareFactor.setShareEntity(widget);
                break;
            case DASHBOARD:
                Dashboard dashboard = dashboardService.getDashboard(shareFactor.getEntityId(), user);
                DashboardPortal portal = dashboardPortalMapper.getById(dashboard.getDashboardPortalId());
                shareFactor.setProjectDetail(projectService.getProjectDetail(portal.getProjectId(), user, false));
                shareFactor.setShareEntity(dashboard);
                break;
            case DISPLAY:
                Display display = displayService.getDisplay(shareFactor.getEntityId(), user);
                shareFactor.setProjectDetail(projectService.getProjectDetail(display.getProjectId(), user, false));
                shareFactor.setShareEntity(display);
                break;
            default:
                break;
        }
    }

    /**
     * 兼容老版本token
     *
     * @param token
     * @param shareFactor
     * @param user
     */
    @Transactional
    public void adaptShareInfo(String token, ShareFactor shareFactor, User user) {
        if (shareFactor.getMode() != ShareMode.COMPATIBLE) {
            return;
        }
        ShareInfo shareInfo = shareService.getShareInfo(token, user);
        shareService.verifyShareUser(user, shareInfo);
        // 新老版本字段定义不同
        shareFactor.setSharerId(shareInfo.getShareUser().getId());
        shareFactor.setEntityId(shareInfo.getShareId());
        shareFactor.setPermission(ShareDataPermission.SHARER);
        shareFactor.setMode(ShareMode.NORMAL);

        // 授权模式
        if (!StringUtils.isEmpty(shareInfo.getSharedUserName())) {
            shareFactor.setMode(ShareMode.AUTH);
            Long viewerId = userMapper.getIdByName(shareInfo.getSharedUserName());
            shareFactor.setViewers(new HashSet<Long>(1) {{
                add(viewerId);
            }});
        }
    }
}
