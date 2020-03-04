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

package edp.davinci.server.dao;


import edp.davinci.core.dao.OrganizationMapper;
import edp.davinci.core.dao.entity.Organization;
import edp.davinci.server.dto.organization.OrganizationInfo;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface OrganizationExtendMapper extends OrganizationMapper {

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
            "select o.*, ifnull(ruo.role ,0) as role ",
            "from organization o ",
            "left join rel_user_organization ruo on (ruo.org_id = o.id and ruo.user_id = #{userId})",
            "where o.id in (",
            "   select id from organization where user_id = #{userId}",
            "    union",
            "   select org_id as id from rel_user_organization where user_id = #{userId}",
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

    @Update({
    	"<script>",
    	"	update organization" + 
    	"	<choose>" + 
    	"		<when test='projectNum > 0'>" + 
    	"			set `project_num`=#{projectNum,jdbcType=INTEGER}" + 
    	"		</when>" + 
    	"		<otherwise>" + 
    	"			set `project_num`=0" + 
    	"		</otherwise>" + 
    	"	</choose>" + 
    	"	<where>" + 
    	"		`id`=#{id,jdbcType=BIGINT}" + 
    	"	</where>",
    	"</script>"
    })
    int updateProjectNum(Organization organization);

    @Update({
    	"<script>",
    	"	update organization" + 
    	"	<choose>" + 
    	"		<when test='memberNum > 0'>" + 
    	"			set `member_num`=#{memberNum,jdbcType=INTEGER}" + 
    	"		</when>" + 
    	"		<otherwise>" + 
    	"			set `member_num`=0" + 
    	"		</otherwise>" + 
    	"	</choose>" + 
    	"	<where>" + 
    	"		`id`=#{id,jdbcType=BIGINT}" + 
    	"	</where>",
    	"</script>"
    })
    int updateMemberNum(Organization organization);

    @Update({
    	"<script>",
    	"	update organization set `role_num`=(role_num + 1) where `id` in" + 
    	"	<foreach collection='set' index='index' item='item' open='(' close=')' separator=','>" + 
    	"		#{item}" + 
    	"	</foreach>",
    	"</script>"
    })
    int addOneMemberNum(@Param("set") Set<Long> orgIds);

    @Update({
    	"<script>",
    	"	update organization" + 
    	"	<choose>" + 
    	"		<when test='roleNum > 0'>" + 
    	"			set `role_num`=#{roleNum,jdbcType=INTEGER}" + 
    	"		</when>" + 
    	"		<otherwise>" + 
    	"			set `role_num`=0" + 
    	"		</otherwise>" + 
    	"	</choose>" + 
    	"	<where>" + 
    	"		`id`=#{id,jdbcType=BIGINT}" + 
    	"	</where>",
    	"</script>"
    })
    int updateRoleNum(Organization organization);

    @Select({
    	"<script>",
    	"	select o.* from" + 
    	"		(organization o," + 
    	"			(" + 
    	"				select `org_id`, count(1) as c" + 
    	"				from rel_user_organization" + 
    	"				where `user_id` in" + 
    	"				<foreach collection='list' index='index' item='item' open='(' close=')' separator=','>#{item}" + 
    	"				</foreach>" + 
    	"				group by `org_id`" + 
    	"				having `c` > 1" + 
    	"			) o1" + 
    	"		)" + 
    	"	left join rel_user_organization ruo on ruo.`org_id` = o.`id` and ruo.`user_id` = #{userId}" + 
    	"	where o.`id` = o1.`org_id`",
    	"</script>"
    })
    List<OrganizationInfo> getJointlyOrganization(@Param("list") List<Long> userIds, @Param("userId") Long userId);
}