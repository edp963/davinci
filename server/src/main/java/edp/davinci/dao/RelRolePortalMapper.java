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

import edp.davinci.core.model.RoleDisableViz;
import edp.davinci.model.RelRolePortal;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface RelRolePortalMapper {

    int insert(RelRolePortal record);


    int insertBatch(@Param("list") List<RelRolePortal> relRolePortals);

    @Select({
            "select rru.role_id as roleId, rrp.portal_id as vizId",
            "from rel_role_portal rrp",
            "       inner join rel_role_user rru on rru.role_id = rrp.role_id",
            "       inner join dashboard_portal p on p.id = rrp.portal_id",
            "where rru.user_id = #{userId} and rrp.visible = 0 and p.project_id = #{projectId}"
    })
    List<RoleDisableViz> getDisablePortalByUser(@Param("userId") Long userId, @Param("projectId") Long projectId);

    @Delete({"delete from rel_role_portal where portal_id = #{portalId}"})
    int deleteByProtalId(@Param("portalId") Long portalId);

    @Select("select role_id from rel_role_portal where portal_id = #{portalId} and visible = 0")
    List<Long> getExecludeRoles(@Param("portalId") Long portalId);

    @Select({
            "select rrp.portal_id",
            "from rel_role_portal rrp",
            "inner join dashboard_portal p on p.id = rrp.portal_id",
            "where rrp.role_id = #{id} and rrp.visible = 0 and p.project_id = #{projectId}"
    })
    List<Long> getExecludePortals(@Param("id") Long id, @Param("projectId") Long projectId);

    @Delete({"delete from rel_role_portal where portal_id = #{portalId} and role_id = #{roleId}"})
    int delete(@Param("portalId") Long portalId, @Param("roleId") Long roleId);

    @Delete({"delete from rel_role_portal where role_id = #{roleId}"})
    int deleteByRoleId(Long roleId);

    @Delete({"delete from rel_role_portal where portal_id in (select id from dashboard_portal where project_id = #{projectId})"})
    int deleteByProject(Long projectId);

    @Delete({"delete from rel_role_portal where role_id = #{roleId} and portal_id in (select id from dashboard_portal where project_id = #{projectId})"})
    int deleteByRoleAndProject(Long roleId, Long projectId);
}