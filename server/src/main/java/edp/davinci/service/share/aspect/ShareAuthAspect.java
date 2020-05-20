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
import edp.core.exception.ForbiddenExecption;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.CollectionUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.ErrorMsg;
import edp.davinci.core.common.ResultMap;
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
    private TokenUtils tokenUtils;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RelRoleUserMapper relRoleUserMapper;

    @Autowired
    private WidgetServiceImpl widgetService;

    @Autowired
    private DashboardServiceImpl dashboardService;

    @Autowired
    private DisplayServiceImpl displayService;

    @Autowired
    private ProjectService projectService;

    @Pointcut("@annotation(edp.core.annotation.AuthShare)")
    public void shareAuth() {
    }

    public static final ThreadLocal<ShareFactor> SHARE_FACTOR_THREAD_LOCAL = new ThreadLocal<>();

    @Around(value = "shareAuth()")

    public ResponseEntity doAround(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        AuthShare authShare = signature.getMethod().getAnnotation(AuthShare.class);
        ShareType shareType = authShare.type();
        ShareOperation operation = authShare.operation();

        Object[] args = joinPoint.getArgs();
        String token = (String) args[0];
        String password = (String) args[1];

        if (StringUtils.isEmpty(token)) {
            ResultMap resultMap = new ResultMap().fail().message(ErrorMsg.ERR_INVALID_TOKEN);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        ShareFactor shareFactor = ShareFactor.parseShareFactor(token, TOKEN_SECRET);

        User user = null;
        for (Object arg : args) {
            if (arg instanceof User) {
                user = (User) arg;
            }
        }

        try {
            //兼容 老版本，token 信息转换为新版本信息
            if (shareFactor.getMode() == ShareMode.COMPATIBLE) {
                adaptShareInfo(token, shareFactor, user);
            }
            // 下载接口数据参数语义不唯一，在业务中判断
            if (operation != ShareOperation.DOWNLOAD) {
                shareFactor.setType(shareType == ShareType.DATA ? ShareType.WIDGET : shareType);
            }

            Set<RelRoleUser> relRoleUsers = relRoleUserMapper.selectByUserAndRoles(user.getId(), shareFactor.getRoles());

            //校验 token 权限
            verifyToken(shareFactor, user, password, relRoleUsers);

            //校验数据权限
            verifyDataPermission(operation, shareFactor, user, relRoleUsers);

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
     * 兼容老版本token
     *
     * @param token
     * @param shareFactor
     * @param user
     */
    private void adaptShareInfo(String token, ShareFactor shareFactor, User user) {
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
            Long viewerId = userMapper.getIdByName(shareInfo.getSharedUserName());
            shareFactor.setViewers(new HashSet<Long>(1) {{
                add(viewerId);
            }});
        }
    }

    /**
     * 校验Token 是否合法
     *
     * @param shareFactor
     * @param user
     * @param password
     * @param relRoleUsers
     * @throws ForbiddenExecption
     */
    private void verifyToken(ShareFactor shareFactor, User user, String password, Set<RelRoleUser> relRoleUsers)
            throws ForbiddenExecption, UnAuthorizedExecption {
        switch (shareFactor.getMode()) {
            case PASSWORD:
                if (StringUtils.isEmpty(password)) {
                    throw new UnAuthorizedExecption(ErrorMsg.ERR_EMPTY_SHARE_PASSWORD);
                }
                if (!password.equals(shareFactor.getPassword())) {
                    throw new ForbiddenExecption(ErrorMsg.ERR_INVALID_SHARE_PASSWORD);
                }
                break;
            case AUTH:
                if (user == null) {
                    throw new UnAuthorizedExecption(ErrorMsg.ERR_MSG_AUTHENTICATION);
                }
                if (shareFactor.getPermission() == ShareDataPermission.SHARER) {
                    if (!user.getId().equals(shareFactor.getSharerId())) {
                        throw new ForbiddenExecption(ErrorMsg.ERR_MSG_PERMISSION);
                    }
                } else {
                    if (!shareFactor.getViewers().contains(user.getId()) && CollectionUtils.isEmpty(relRoleUsers)) {
                        throw new ForbiddenExecption(ErrorMsg.ERR_MSG_PERMISSION);
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
     * @param shareFactor
     * @param viewer
     * @param relRoleUsers
     */
    private void verifyDataPermission(ShareOperation shareOperation, ShareFactor shareFactor, User viewer, Set<RelRoleUser> relRoleUsers)
            throws NotFoundException, ServerException, ForbiddenExecption, UnAuthorizedExecption {
        User sharer = userMapper.getById(shareFactor.getSharerId());
        if (sharer == null) {
            throw new ForbiddenExecption(ErrorMsg.ERR_INVALID_SHARER);
        }
        shareFactor.setShareUser(sharer);
        User user = shareFactor.getPermission() == ShareDataPermission.SHARER ? sharer : viewer;
        if (shareOperation == ShareOperation.READ) {
            switch (shareFactor.getType()) {
                case WIDGET:
                    Widget widget = widgetService.getWidget(shareFactor.getEntityId(), user);
                    shareFactor.setShareEntity(widget);
                    break;
                case DASHBOARD:
                    Dashboard dashboard = dashboardService.getDashboard(shareFactor.getEntityId(), user);
                    shareFactor.setShareEntity(dashboard);
                    break;
                case DISPLAY:
                    Display display = displayService.getDisplay(shareFactor.getSharerId(), user);
                    shareFactor.setShareEntity(display);
                    break;
                default:
                    break;
            }
        } else if (shareOperation == ShareOperation.LOAD_DATA) {
            if (shareFactor.getType() != ShareType.WIDGET) {
                throw new ForbiddenExecption(ErrorMsg.ERR_LOAD_DATA_TOKEN);
            }
            Widget widget = widgetService.getWidget(shareFactor.getEntityId(), user);
            ProjectDetail projectDetail = projectService.getProjectDetail(widget.getProjectId(), user, false);
            if (!projectService.allowGetData(projectDetail, user)) {
                throw new UnAuthorizedExecption(ErrorMsg.ERR_MSG_PERMISSION);
            }
            shareFactor.setShareEntity(widget);
        } else {
            // 下载权限数据权限在业务中判断
            return;
        }
    }
}
