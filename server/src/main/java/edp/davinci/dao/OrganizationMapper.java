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


import edp.davinci.dto.organizationDto.OrganizationInfo;
import edp.davinci.model.Organization;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface OrganizationMapper {

    int insert(Organization organization);

    @Select({"select * from organization where id = #{id}"})
    Organization getById(@Param("id") Long id);


    @Select({"select id from organization where name = #{name}"})
    Long getIdByName(@Param("name") String name);


    /**
     * 获取组织列表
     * 当前用户创建 + Member（关联表用户是当前用户）
     *
     * @param userId
     * @return
     */
    @Select({
            "SELECT o.*, IFNULL(ruo.role ,0) as role ",
            "FROM organization o ",
            "LEFT JOIN rel_user_organization ruo ON (ruo.org_id = o.id and ruo.user_id = #{userId})",
            "WHERE o.id IN (",
            "   SELECT id FROM organization WHERE user_id = #{userId}",
            "    union",
            "   SELECT org_id as id FROM rel_user_organization WHERE user_id = #{userId}",
            ")",
    })
    List<OrganizationInfo> getOrganizationByUser(@Param("userId") Long userId);


    @Update({
            "update organization",
            "set `name` = #{name},",
            "description = #{description},",
            "avatar = #{avatar},",
            "user_id = #{userId},",
            "allow_create_project = #{allowCreateProject},",
            "member_permission = #{memberPermission},",
            "update_time = #{updateTime},",
            "update_by = #{updateBy}",
            "where id = #{id}"
    })
    int update(Organization organization);


    int updateProjectNum(Organization organization);

    int updateMemberNum(Organization organization);

    int addOneMemberNum(@Param("set") Set<Long> orgIds);

    int updateRoleNum(Organization organization);


    @Delete({"delete from organization where id = #{id}"})
    int deleteById(@Param("id") Long id);


    List<OrganizationInfo> getJointlyOrganization(@Param("list") List<Long> userIds, @Param("userId") Long userId);
}