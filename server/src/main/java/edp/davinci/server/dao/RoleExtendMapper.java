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
 *
 */

package edp.davinci.server.dao;

import edp.davinci.core.dao.RoleMapper;
import edp.davinci.core.dao.entity.Role;
import edp.davinci.server.dto.role.RoleBaseInfo;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

public interface RoleExtendMapper extends RoleMapper {

	@Insert({
		"<script>",
		"	insert into role" + 
		"		<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"			`org_id`," + 
		"			`name`," + 
		"			`description`," + 
		"			`create_by`," + 
		"			`create_time`" + 
		"		</trim>" + 
		"		<trim prefix='values (' suffix=')' suffixOverrides=','>" + 
		"			#{orgId,jdbcType=BIGINT}," + 
		"			#{name,jdbcType=VARCHAR}," + 
		"			#{description,jdbcType=VARCHAR}," + 
		"			#{createBy,jdbcType=BIGINT}," + 
		"			#{createTime,jdbcType=TIMESTAMP}" + 
		"		</trim>",
		"</script>"
	})
	int insert(Role record);

    @Select({
            "select a.* " +
                    "from role a " +
                    "left join rel_role_user b on b.role_id = a.id " +
                    "where a.org_id = #{orgId,jdbcType=BIGINT} and b.user_id = #{userId,jdbcType=BIGINT} "
    })
    List<Role> getRolesByOrgAndUser(@Param("orgId") Long orgId, @Param("userId") Long userId);

    @Select({
    	"<script>",
    	"	select * from role where" + 
    	"		<if test='list != null and list.size > 0'>" + 
    	"			id in" + 
    	"			<foreach collection='list' index='index' item='item' open='(' close=')' separator=','>" + 
    	"				#{item}" + 
    	"			</foreach>" + 
    	"		</if>" + 
    	"		<if test='list == null or list.size == 0'>" + 
    	"			1=0" + 
    	"		</if>",
    	"</script>"
    })
    List<Role> getRolesByIds(List<Long> list);

    @Update({
            "update `role` set ",
            "`org_id` = #{orgId,jdbcType=BIGINT},",
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

    @Select({
    	"<script>",
    	"	select * from role where org_id = #{orgId}" + 
    	"		<if test='roleIds != null and roleIds.size > 0'>" + 
    	"			and id in" + 
    	"			<foreach collection='roleIds' index='index' item='item' open='(' close=')' separator=','>" + 
    	"				#{item}" + 
    	"			</foreach>" + 
    	"		</if>" + 
    	"		<if test='roleIds == null or roleIds.size == 0'>" + 
    	"			and 1=0" + 
    	"		</if>",
    	"</script>"
    })
    List<Role> getByOrgIdAndIds(@Param("orgId") Long orgId, @Param("roleIds") List<Long> roleIds);

    @Delete({"delete from `role` where org_id = #{orgId}"})
    int deleteByOrg(Long orgId);

    @Select({
            "select distinct r.id from role r inner join rel_role_project rrp on rrp.role_id = r.id",
            "inner join dashboard_portal p on p.project_id = rrp.project_id",
            "inner join rel_role_user rru on rru.role_id = r.id",
            "where p.id = #{portalId} and rru.user_id = #{userId}"
    })
    List<Long> getRolesByUserAndPortal(@Param("userId") Long userId, @Param("portalId") Long portalId);

    @Select({
            "select distinct r.id from role r inner join rel_role_project rrp on rrp.role_id = r.id",
            "inner join display d on d.project_id = rrp.project_id ",
            "inner join rel_role_user rru on rru.role_id = r.id",
            "where d.id = #{displayId} and rru.user_id = #{userId}"
    })
    List<Long> getRolesByUserAndDisplay(@Param("userId") Long userId, @Param("displayId") Long displayId);

    @Select({
            "select distinct r.id from role r",
            "inner join rel_role_project rrp on rrp.role_id = r.id",
            "inner join rel_role_user rru on rru.role_id = r.id",
            "where rrp.project_id = #{projectId} and rru.user_id = #{userId}"
    })
    List<Long> getRolesByUserAndProject(@Param("userId") Long userId, @Param("projectId") Long projectId);

    @Select({ 
            "select r.* from role r", 
            "left join rel_role_user rru on rru.role_id = r.id",
            "where r.org_id = #{orgId} and rru.user_id = #{memberId}"
    })
    List<Role> selectByOrgIdAndMemberId(@Param("orgId") Long orgId, @Param("memberId") Long memberId);
}