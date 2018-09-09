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

package edp.davinci.common.service;

import com.alibaba.druid.util.StringUtils;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.dao.OrganizationMapper;
import edp.davinci.dao.RelTeamProjectMapper;
import edp.davinci.dao.RelUserOrganizationMapper;
import edp.davinci.dao.RelUserTeamMapper;
import edp.davinci.model.*;
import edp.davinci.service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

@Component
public class CommonService<T> {

    @Autowired
    public RelUserOrganizationMapper relUserOrganizationMapper;

    @Autowired
    public RelUserTeamMapper relUserTeamMapper;

    @Autowired
    public RelTeamProjectMapper relTeamProjectMapper;

    @Autowired
    public OrganizationMapper organizationMapper;

    @Autowired
    private ShareService shareService;

    @Value("${server.protocol:http}")
    private String protocol;

    @Value("${server.address:localhost}")
    private String address;

    @Value("${server.port}")
    public String port;


    private static final String HTTP_PROTOCOL = "http";

    private static final String HTTPS_PROTOCOL = "https";

    private static final String PROTOCOL_SEPARATOR = "://";

    public String getHost() {
        protocol = protocol.trim().toLowerCase();

        if (protocol.equals(HTTP_PROTOCOL)) {
            if ("80".equals(port)) {
                port = null;
            }
        }

        if (protocol.equals(HTTPS_PROTOCOL)) {
            if ("443".equals(port)) {
                port = null;
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append(protocol).append(PROTOCOL_SEPARATOR).append(address);
        if (!StringUtils.isEmpty(port)) {
            sb.append(":" + port);
        }
        return sb.toString();
    }

    /**
     * 获取分享链接
     *
     * @param userId
     * @param contentType
     * @param contengId
     * @return
     */
    public String getContentUrl(Long userId, String contentType, Long contengId) {
        String shareToken = shareService.generateShareToken(contengId, null, userId);
        StringBuilder sb = new StringBuilder();
        sb.append("http://")
                .append(getHost())
                .append("/share.html#/share/")
                .append(contentType.equals("widget") ? "dashboard" : contentType)
                .append("?shareInfo=")
                .append(shareToken)
                .append(contentType.equals("widget") ? "?type=widget" : "");

        return sb.toString();
    }


    public boolean isProjectAdmin(Project project, User user) {
        if (project.getUserId().equals(user.getId()) && !project.getIsTransfer()) {
            return true;
        }
        return false;
    }

    /**
     * user是否project 的维护者
     *
     * @param project
     * @param user
     * @return
     */
    public boolean isMaintainer(Project project, User user) {
        if (null == project || null == user) {
            return false;
        }

        //当前project的creater
        if (isProjectAdmin(project, user)) {
            return true;
        }

        Organization organization = organizationMapper.getById(project.getOrgId());
        if (null != organization && organization.getUserId().equals(user.getId())) {
            return true;
        }

        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());

        if (null == orgRel) {
            return false;
        }

        if (orgRel.getRole() == UserOrgRoleEnum.OWNER.getRole()) {
            return true;
        }

        return false;
    }


    /**
     * 读权限
     * 1. 当前project的owner
     * 2. 当前project所属organization的owner
     * 3. 当前project对应team的maintainer
     * 4. 当前project对应team的member且project下内容的权限
     *
     * @param project
     * @param user
     * @return
     */
    public boolean allowRead(Project project, User user) {

        if (null == project || null == user) {
            return false;
        }

        //当前project的owner
        if (isProjectAdmin(project, user)) {
            return true;
        }


        Organization organization = organizationMapper.getById(project.getOrgId());
        if (null == organization) {
            return false;
        }

        if (organization.getUserId().equals(user.getId())) {
            return true;
        }

        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == orgRel) {
            return false;
        }

        //当前project所属organization的owner
        if (orgRel.getRole() == UserOrgRoleEnum.OWNER.getRole()) {
            return true;
        }

        Short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());
        if (maxTeamRole == UserTeamRoleEnum.MAINTAINER.getRole()) {
            //当前project对应team的maintainer
            return true;
        } else {
            //不可见
            if (!project.getVisibility()) {
                return false;
            }
            Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(organization.getId(), user.getId());
            if (teamNumOfOrgByUser > 0) {
                //当前project对应team的member且project下内容的权限
                short maxVizPermission = getMaxPermission(organization, project, user);
                if (maxVizPermission > UserPermissionEnum.HIDDEN.getPermission()) {
                    return true;
                }
            } else {
                if (organization.getMemberPermission() > UserPermissionEnum.HIDDEN.getPermission()) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 允许创建更新
     * 1. 当前project的owner
     * 2. 当前project所属organization的owner
     * 3. 当前project对应team的maintainer
     * 4. 当前project对应team的member且project下内容的权限
     *
     * @param project
     * @param user
     * @return
     */
    public boolean allowWrite(Project project, User user) {

        if (null == project || null == user) {
            return false;
        }

        //当前project的owner
        if (isProjectAdmin(project, user)) {
            return true;
        }

        Organization organization = organizationMapper.getById(project.getOrgId());
        if (null == organization) {
            return false;
        }

        if (organization.getUserId().equals(user.getId())) {
            return true;
        }

        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == orgRel) {
            return false;
        }

        //当前project所属organization的owner
        if (orgRel.getRole() == UserOrgRoleEnum.OWNER.getRole()) {
            return true;
        }

        Short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());

        if (maxTeamRole == UserTeamRoleEnum.MAINTAINER.getRole()) {
            //当前project对应team的maintainer
            return true;
        } else {
            //不可见
            if (!project.getVisibility()) {
                return false;
            }
            Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(organization.getId(), user.getId());
            if (teamNumOfOrgByUser > 0) {
                //当前project对应team的member且project下内容的权限
                short maxVizPermission = getMaxPermission(organization, project, user);
                if (maxVizPermission > UserPermissionEnum.READ.getPermission()) {
                    return true;
                }
            } else {
                if (organization.getMemberPermission() > UserPermissionEnum.READ.getPermission()) {
                    return true;
                }
            }

        }

        return false;
    }


    /**
     * 允许删除
     * 1. 当前project的owner
     * 2. 当前project所属organization的owner
     * 3. 当前project对应team的maintainer
     * 4. 当前project对应team的member且project下内容的权限
     *
     * @param project
     * @param user
     * @return
     */
    public boolean allowDelete(Project project, User user) {

        if (null == project || null == user) {
            return false;
        }

        //当前project的owner
        if (isProjectAdmin(project, user)) {
            return true;
        }

        Organization organization = organizationMapper.getById(project.getOrgId());
        if (null == organization) {
            return false;
        }

        if (organization.getUserId().equals(user.getId())) {
            return true;
        }

        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == orgRel) {
            return false;
        }

        //当前project所属organization的owner
        if (orgRel.getRole() == UserOrgRoleEnum.OWNER.getRole()) {
            return true;
        }

        short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());

        if (maxTeamRole == UserTeamRoleEnum.MAINTAINER.getRole()) {
            //当前project对应team的maintainer
            return true;
        } else {
            //不可见
            if (!project.getVisibility()) {
                return false;
            }
            Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(organization.getId(), user.getId());
            if (teamNumOfOrgByUser > 0) {
                //当前project对应team的member且project下内容的权限
                short maxVizPermission = getMaxPermission(organization, project, user);
                if (maxVizPermission > UserPermissionEnum.WRITE.getPermission()) {
                    return true;
                }
            } else {
                if (organization.getMemberPermission() > UserPermissionEnum.WRITE.getPermission()) {
                    return true;
                }
            }
        }

        return false;
    }


    /**
     * 允许分享
     * 1. 当前project的owner
     * 2. 当前project所属organization的owner
     * 3. 当前project对应team的maintainer
     * 4. 当前project对应team的member且project下内容的权限
     *
     * @param project
     * @param user
     * @return
     */
    public boolean allowShare(Project project, User user) {
        if (null == project || null == user) {
            return false;
        }

        //当前project的owner
        if (isProjectAdmin(project, user)) {
            return true;
        }

        Organization organization = organizationMapper.getById(project.getOrgId());
        if (null == organization) {
            return false;
        }

        if (organization.getUserId().equals(user.getId())) {
            return true;
        }

        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == orgRel) {
            return false;
        }

        //当前project所属organization的owner
        if (orgRel.getRole() == UserOrgRoleEnum.OWNER.getRole()) {
            return true;
        }

        short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());

        if (maxTeamRole == UserTeamRoleEnum.MAINTAINER.getRole()) {
            //当前project对应team的maintainer
            return true;
        } else {
            //不可见
            if (!project.getVisibility()) {
                return false;
            }
            //当前project对应team的member且project下内容的分享权限
            Boolean bol = relTeamProjectMapper.getMaxSharePermission(project.getId(), user.getId());
            return null != bol && bol;
        }
    }


    /**
     * 允许下载
     * 1. 当前project的owner
     * 2. 当前project所属organization的owner
     * 3. 当前project对应team的maintainer
     * 4. 当前project对应team的member且project下内容的权限
     *
     * @param project
     * @param user
     * @return
     */
    public boolean allowDownload(Project project, User user) {
        if (null == project || null == user) {
            return false;
        }

        //当前project的owner
        if (isProjectAdmin(project, user)) {
            return true;
        }

        Organization organization = organizationMapper.getById(project.getOrgId());
        if (null == organization) {
            return false;
        }

        if (organization.getUserId().equals(user.getId())) {
            return true;
        }

        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), organization.getId());
        if (null == orgRel) {
            return false;
        }

        //当前project所属organization的owner
        if (orgRel.getRole() == UserOrgRoleEnum.OWNER.getRole()) {
            return true;
        }

        short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());

        if (maxTeamRole == UserTeamRoleEnum.MAINTAINER.getRole()) {
            //当前project对应team的maintainer
            return true;
        } else {
            //不可见
            if (!project.getVisibility()) {
                return false;
            }
            //当前project对应team的member且project下内容的分享权限
            Boolean bol = relTeamProjectMapper.getMaxDownloadPermission(project.getId(), user.getId());
            return null != bol && bol;
        }
    }


    /**
     * 获取Viz权限
     *
     * @param project
     * @param user
     * @return
     */
    public short vizPermission(Project project, User user) {
        if (null == project || null == user) {
            return 0;
        }
        if (isProjectAdmin(project, user)) {
            return UserPermissionEnum.DELETE.getPermission();
        }

        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        if (null == orgRel) {
            return 0;
        }

        if (orgRel.getRole() == UserOrgRoleEnum.OWNER.getRole()) {
            return UserPermissionEnum.DELETE.getPermission();
        }


        Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(project.getOrgId(), user.getId());
        if (teamNumOfOrgByUser > 0) {
            short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());
            if (maxTeamRole == UserTeamRoleEnum.MAINTAINER.getRole()) {
                return UserPermissionEnum.DELETE.getPermission();
            } else {
                return relTeamProjectMapper.getMaxVizPermission(project.getId(), user.getId());
            }
        } else {
            Organization organization = organizationMapper.getById(project.getOrgId());
            return organization.getMemberPermission();
        }
    }


    public short getMaxPermission(Organization organization, Project project, User user) {
        short maxVizPermission = (short) 0;

        Type type = getClass().getGenericSuperclass();

        Object clazz = null;

        if (type instanceof ParameterizedType) {
            Type[] actualTypeArguments = ((ParameterizedType) type).getActualTypeArguments();
            try {
                clazz = ((Class) actualTypeArguments[0]).newInstance();
            } catch (Exception e) {
                clazz = null;
            }
        }

        if (clazz instanceof Source) {
            maxVizPermission = relTeamProjectMapper.getMaxSourcePermission(project.getId(), user.getId());
        } else if (clazz instanceof View) {
            maxVizPermission = relTeamProjectMapper.getMaxViewPermission(project.getId(), user.getId());
        } else if (clazz instanceof Widget) {
            maxVizPermission = relTeamProjectMapper.getMaxWidgetPermission(project.getId(), user.getId());
        } else if (clazz instanceof DashboardPortal || clazz instanceof Dashboard || clazz instanceof Display) {
            maxVizPermission = relTeamProjectMapper.getMaxVizPermission(project.getId(), user.getId());
        } else if (clazz instanceof CronJob) {
            maxVizPermission = relTeamProjectMapper.getMaxSchedulePermission(project.getId(), user.getId());
        }

        if (null != clazz) {
            clazz = null;
            System.gc();
        }

        return maxVizPermission;
    }

}
