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

import edp.davinci.dto.roleDto.RoleBaseInfo;
import edp.davinci.model.Role;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

public interface RoleMapper {
    int insert(Role record);

    @Delete({
            "delete from `role` where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);

    @Select({
            "select * from `role` where id = #{id,jdbcType=BIGINT}"
    })
    Role getById(Long id);


    @Select({
            "SELECT a.* " +
                    "FROM role a " +
                    "LEFT JOIN rel_role_user b ON b.role_id = a.id " +
                    "WHERE a.org_id = #{orgId,jdbcType=BIGINT} AND b.user_id = #{userId,jdbcType=BIGINT} "
    })
    List<Role> getRolesByOrgAndUser(@Param("orgId") Long orgId, @Param("userId") Long userId);

    List<Role> getRolesByIds(List<Long> list);

    @Update({
            "update `role`",
            "set `org_id` = #{orgId,jdbcType=BIGINT},",
            "`name` = #{name,jdbcType=VARCHAR},",
            "`description` = #{description,jdbcType=VARCHAR},",
            "`create_by` = #{createBy,jdbcType=BIGINT},",
            "`create_time` = #{createTime,jdbcType=TIMESTAMP},",
            "`update_by` = #{updateBy,jdbcType=BIGINT},",
            "`update_time` = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(Role record);


    @Select({
            "select id, `name`, description  from `role` where org_id = #{orgId}"
    })
    List<RoleBaseInfo> getBaseInfoByOrgId(Long orgId);


    List<Role> selectByIdsAndOrgId(@Param("orgId") Long orgId, @Param("roleIds") List<Long> roleIds);


    @Delete({"delete from `role` where org_id = #{orgId}"})
    int deleteByOrg(Long orgId);


    @Select({
            "SELECT DISTINCT r.id FROM role r INNER JOIN rel_role_project rrp on rrp.role_id = r.id",
            "INNER JOIN dashboard_portal p on p.project_id = rrp.project_id",
            "INNER JOIN rel_role_user rru on rru.role_id = r.id",
            "WHERE p.id = #{portalId} and rru.user_id = #{userId}"
    })
    List<Long> getRolesByUserAndPortal(@Param("userId") Long userId, @Param("portalId") Long portalId);


    @Select({
            "SELECT DISTINCT r.id FROM role r INNER JOIN rel_role_project rrp on rrp.role_id = r.id",
            "INNER JOIN display d on d.project_id = rrp.project_id ",
            "INNER JOIN rel_role_user rru on rru.role_id = r.id",
            "WHERE d.id = #{displayId} and rru.user_id = #{userId}"
    })
    List<Long> getRolesByUserAndDisplay(@Param("userId") Long userId, @Param("displayId") Long displayId);

    @Select({
            "SELECT DISTINCT r.id FROM role r",
            "INNER JOIN rel_role_project rrp on rrp.role_id = r.id",
            "INNER JOIN rel_role_user rru on rru.role_id = r.id",
            "WHERE rrp.project_id = #{projectId} and rru.user_id = #{userId}"
    })
    List<Long> getRolesByUserAndProject(@Param("userId") Long userId, @Param("projectId") Long projectId);

    @Select({
            "SELECT r.* FROM role r",
            "LEFT JOIN rel_role_user rru on rru.role_id = r.id",
            "WHERE r.org_id = #{orgId} and rru.user_id = #{memberId}"
    })
    List<Role> selectByOrgIdAndMemberId(@Param("orgId") Long orgId, @Param("memberId") Long memberId);
}