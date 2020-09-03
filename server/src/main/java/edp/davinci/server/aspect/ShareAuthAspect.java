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

package edp.davinci.server.aspect;


import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.*;
import edp.davinci.server.annotation.AuthShare;
import edp.davinci.server.commons.ErrorMsg;
import edp.davinci.server.controller.ResultMap;
import edp.davinci.server.dao.DashboardPortalExtendMapper;
import edp.davinci.server.dao.RelRoleUserExtendMapper;
import edp.davinci.server.dao.UserExtendMapper;
import edp.davinci.server.dto.project.ProjectDetail;
import edp.davinci.server.dto.share.ShareFactor;
import edp.davinci.server.dto.share.ShareInfo;
import edp.davinci.server.enums.*;
import edp.davinci.server.exception.ForbiddenException;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.service.*;

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
    private UserExtendMapper userExtendMapper;

    @Autowired
    private RelRoleUserExtendMapper relRoleUserExtendMapper;

    @Autowired
    private WidgetService widgetService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private DashboardPortalExtendMapper dashboardPortalExtendMapper;

    @Autowired
    private DisplayService displayService;

    @Autowired
    private ProjectService projectService;

    @Pointcut("@annotation(edp.davinci.server.annotation.AuthShare)")
    public void shareAuth() {
    }

    public static final ThreadLocal<ShareFactor> SHARE_FACTOR_THREAD_LOCAL = new ThreadLocal<>();

    @Around(value = "shareAuth()")

    @Transactional
    public ResponseEntity doAround(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        AuthShare authShare = signature.getMethod().getAnnotation(AuthShare.class);
        ShareType flagShareType = authShare.type();
        ShareOperation operation = authShare.operation();

        Object[] args = joinPoint.getArgs();
        String token = (String) args[0];
        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().fail().message(ErrorMsg.ERR_INVALID_TOKEN);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        ShareFactor shareFactor = ShareFactor.parseShareFactor(token, TOKEN_SECRET);

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
            //兼容 老版本，token 信息转换为新版本信息
            adaptShareInfo(token, shareFactor, user);
            // 下载接口数据参数语义不唯一，在业务中判断
            if (operation != ShareOperation.DOWNLOAD) {
                if (operation == ShareOperation.PERMISSION) {
                    //获取兼容模式下的分享类型
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
                    shareFactor.setType(flagShareType == ShareType.DATA ? ShareType.WIDGET : flagShareType);
                }
            }

            if (flagShareType != ShareType.LOGIN) {
                //校验 token 权限
                verifyToken(operation, shareFactor, user, args);

                //校验数据权限
                verifyDataPermission(operation, flagShareType, shareFactor, user);
            }
            //thread local share factor
            SHARE_FACTOR_THREAD_LOCAL.set(shareFactor);
            // 处理业务并返回
            return (ResponseEntity) joinPoint.proceed(args);
        } finally {
            // clean thread local
            SHARE_FACTOR_THREAD_LOCAL.remove();
        }
    }

    /**
     *
     * 校验Token 是否合法
     *
     * @param operation
     * @param shareFactor
     * @param user
     * @param args
     * @throws ForbiddenException
     * @throws UnAuthorizedExecption
     */
    private void verifyToken(ShareOperation operation, ShareFactor shareFactor, User user, Object[] args)
            throws ForbiddenException, UnAuthorizedExecption {
        switch (shareFactor.getMode()) {
            case PASSWORD:
                String password = (String) args[1];
                if (StringUtils.isEmpty(password)) {
                    throw new UnAuthorizedExecption(operation == ShareOperation.LOAD_DATA ? ErrorMsg.ERR_INVALID_DATA_TOKEN : ErrorMsg.ERR_EMPTY_PASSWORD);
                }
                if (!password.equals(shareFactor.getPassword())) {
                    throw new ForbiddenException(operation == ShareOperation.LOAD_DATA ? ErrorMsg.ERR_INVALID_DATA_TOKEN : ErrorMsg.ERR_INVALID_PASSWORD);
                }
                break;
            case AUTH:
                if (user == null) {
                    throw new UnAuthorizedExecption(ErrorMsg.ERR_AUTHENTICATION);
                }
                if (!shareFactor.getViewers().contains(user.getId())) {
                    Set<RelRoleUser> relRoleUsers = relRoleUserExtendMapper.getByUserAndRoles(user.getId(), shareFactor.getRoles());
                    if (!shareFactor.getViewers().contains(user.getId()) && CollectionUtils.isEmpty(relRoleUsers)) {
                        throw new ForbiddenException(ErrorMsg.ERR_PERMISSION);
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
     * @param flagShareType
     * @param shareFactor
     * @param viewer
     */
    @Transactional
    protected void verifyDataPermission(ShareOperation shareOperation, ShareType flagShareType, ShareFactor shareFactor, User viewer)
            throws NotFoundException, ServerException, ForbiddenException, UnAuthorizedExecption {
        User sharer = userExtendMapper.selectByPrimaryKey(shareFactor.getSharerId());
        if (sharer == null) {
            throw new ForbiddenException(ErrorMsg.ERR_INVALID_SHARER);
        }
        User user = shareFactor.getPermission() == ShareDataPermission.SHARER ? sharer : viewer;
        shareFactor.setUser(user);
        if (shareOperation == ShareOperation.READ || shareOperation == ShareOperation.PERMISSION) {
            parseEntityAndProject(shareFactor, user);
        } else if (shareOperation == ShareOperation.LOAD_DATA) {
            if (shareFactor.getType() != ShareType.WIDGET) {
                throw new ForbiddenException(ErrorMsg.ERR_INVALID_DATA_TOKEN);
            }
            Widget widget = widgetService.getWidget(shareFactor.getEntityId(), user);
            ProjectDetail projectDetail = projectService.getProjectDetail(widget.getProjectId(), user, false);
            if (!projectService.allowGetData(projectDetail, user)) {
                throw new UnAuthorizedExecption(ErrorMsg.ERR_PERMISSION);
            }
            shareFactor.setShareEntity(widget);
        } else {
            // 下载权限数据权限在业务中判断
            if (flagShareType != ShareType.DATA) {
                parseEntityAndProject(shareFactor, user);
            }
            return;
        }
    }

    private void parseEntityAndProject(ShareFactor shareFactor, User user) {
        switch (shareFactor.getType()) {
            case WIDGET:
                Widget widget = widgetService.getWidget(shareFactor.getEntityId(), user);
                shareFactor.setProjectDetail(projectService.getProjectDetail(widget.getProjectId(), user, false));
                shareFactor.setShareEntity(widget);
                break;
            case DASHBOARD:
                Dashboard dashboard = dashboardService.getDashboard(shareFactor.getEntityId(), user);
                DashboardPortal portal = dashboardPortalExtendMapper.selectByPrimaryKey(dashboard.getDashboardPortalId());
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
        //新老版本字段定义不同
        shareFactor.setSharerId(shareInfo.getShareUser().getId());
        shareFactor.setEntityId(shareInfo.getShareId());
        shareFactor.setPermission(ShareDataPermission.SHARER);
        shareFactor.setMode(ShareMode.NORMAL);

        //授权模式
        if (!StringUtils.isEmpty(shareInfo.getSharedUserName())) {
            shareFactor.setMode(ShareMode.AUTH);
            Long viewerId = userExtendMapper.getIdByName(shareInfo.getSharedUserName());
            shareFactor.setViewers(new HashSet<Long>(1) {{
                add(viewerId);
            }});
        }
    }

}