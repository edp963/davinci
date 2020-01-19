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

package edp.davinci.dao;

import edp.davinci.dto.projectDto.UserMaxProjectPermission;
import edp.davinci.dto.roleDto.RoleBaseInfo;
import edp.davinci.dto.roleDto.RoleWithProjectPermission;
import edp.davinci.model.RelRoleProject;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.Set;

public interface RelRoleProjectMapper {

    int insert(RelRoleProject record);

    @Delete({
            "delete from rel_role_project where id = #{relationId}"
    })
    int deleteById(@Param("relationId") Long relationId);

    @Delete({
            "delete from rel_role_project where project_id = #{projectId}"
    })
    int deleteByProjectId(@Param("projectId") Long projectId);


    @Select({
            "select * from rel_role_project where id = #{id,jdbcType=BIGINT}"
    })
    RelRoleProject getById(Long id);

    @Update({
            "update rel_role_project",
            "set project_id = #{projectId,jdbcType=BIGINT},",
            "role_id = #{roleId,jdbcType=BIGINT},",
            "source_permission = #{sourcePermission,jdbcType=SMALLINT},",
            "view_permission = #{viewPermission,jdbcType=SMALLINT},",
            "widget_permission = #{widgetPermission,jdbcType=SMALLINT},",
            "viz_permission = #{vizPermission,jdbcType=SMALLINT},",
            "schedule_permission = #{schedulePermission,jdbcType=SMALLINT},",
            "share_permission = #{sharePermission,jdbcType=BIT},",
            "download_permission = #{downloadPermission,jdbcType=BIT},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(RelRoleProject record);

    @Select({
            "select * from rel_role_project where role_id = #{roleId} and project_id = #{projectId}"
    })
    RelRoleProject getByRoleAndProject(@Param("roleId") Long roleId, @Param("projectId") Long projectId);

    List<UserMaxProjectPermission> getMaxPermissions(@Param("projectIds") Set<Long> projectIds, @Param("userId") Long userId);

    UserMaxProjectPermission getMaxPermission(@Param("projectId") Long projectId, @Param("userId") Long userId);

    int insertBatch(@Param("list") List<RelRoleProject> list);

    @Delete({
            "delete from rel_role_project where role_id = #{roleId}"
    })
    int deleteByRoleId(Long roleId);


    @Select({
            "select r.id,",
            "       r.name,",
            "       r.description",
            "from role r",
            "       left join rel_role_project rrp on rrp.role_id = r.id",
            "where rrp.project_id = #{projectId}",
    })
    List<RoleBaseInfo> getRoleBaseInfoByProject(Long projectId);

    @Select({
            "select r.id,",
            "       r.name,",
            "       r.description,",
            "       rrp.source_permission   as 'permission.sourcePermission',",
            "       rrp.view_permission     as 'permission.viewPermission',",
            "       rrp.widget_permission   as 'permission.widgetPermission',",
            "       rrp.viz_permission      as 'permission.vizPermission',",
            "       rrp.schedule_permission as 'permission.schedulePermission',",
            "       rrp.share_permission    as 'permission.sharePermission',",
            "       rrp.download_permission as 'permission.downloadPermission'",
            "from role r",
            "       left join rel_role_project rrp on rrp.role_id = r.id",
            "where rrp.project_id = #{projectId} and rrp.role_id = #{roleId}",
    })
    RoleWithProjectPermission getPermission(@Param("projectId") Long projectId, @Param("roleId") Long roleId);

    @Delete({
            "delete from rel_role_project where role_id = #{roleId} and project_id = #{projectId}"
    })
    int deleteByRoleAndProject(@Param("roleId") Long roleId, @Param("projectId") Long projectId);

    List<RelRoleProject> getByProject(@Param("projectId") Long id);

    int deleteByIds(@Param("list") List<Long> list);
}