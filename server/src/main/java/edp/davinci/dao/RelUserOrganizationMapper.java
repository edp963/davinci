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

package edp.davinci.dao;

import edp.davinci.dto.organizationDto.OrganizationMember;
import edp.davinci.model.RelUserOrganization;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface RelUserOrganizationMapper {

    int insert(RelUserOrganization relUserOrganization);

    @Select({"select * from rel_user_organization where user_id = #{userId} and org_id = #{orgId}"})
    RelUserOrganization getRel(@Param("userId") Long userId, @Param("orgId") Long orgId);

    @Delete("delete from rel_user_organization where org_id = #{orgId}")
    int deleteByOrgId(@Param("orgId") Long orgId);


    @Select({
            "SELECT ruo.id, tm.team_num, ",
            "u.id AS 'user.id', IF(u.`name` is NULL,u.username,u.`name`) AS 'user.username', u.avatar AS 'user.avatar', ruo.role AS 'user.role'",
            "FROM rel_user_organization ruo",
            "LEFT JOIN `user` u on u.id = ruo.user_id",
            "LEFT JOIN organization o on o.id = ruo.org_id",
            //成员在当前组织下的团队数
            "LEFT JOIN (",
            "	SELECT ruo.user_id, COUNT(rut.id) team_num",
            "	FROM rel_user_organization ruo",
            "	LEFT JOIN rel_user_team rut on ruo.user_id = rut.user_id",
            "	WHERE ruo.org_id = #{orgId} GROUP BY ruo.user_id",
            ") tm on tm.user_id = u.id",
            "WHERE ruo.org_id = #{orgId}"
    })
    List<OrganizationMember> getOrgMembers(@Param("orgId") Long orgId);


    @Select({"select * from rel_user_organization where id = #{id}"})
    RelUserOrganization getById(@Param("id") Long id);

    @Delete({"delete from rel_user_organization where id = #{id}"})
    int deleteById(@Param("id") Long id);

    @Update({"update rel_user_organization set role = #{role} where id= #{id}"})
    int updateMemberRole(RelUserOrganization relUserOrganization);


    @Select({"SELECT r.* FROM rel_user_organization r inner join project p on p.org_id = r.org_id where r.user_id = #{userId} and p.id = #{projectId}"})
    RelUserOrganization getRelByProject(@Param("userId") Long userId, @Param("projectId") Long projectId);


    int insertBatch(@Param("set") Set<RelUserOrganization> set);


    int deleteBatch(@Param("set") Set<Long> set);

}