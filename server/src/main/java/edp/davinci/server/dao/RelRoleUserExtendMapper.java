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

import edp.davinci.core.dao.RelRoleUserMapper;
import edp.davinci.core.dao.entity.RelRoleUser;
import edp.davinci.server.dto.role.RelRoleMember;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface RelRoleUserExtendMapper extends RelRoleUserMapper {

	@Insert({
		"<script>",
		"	insert ignore rel_role_user" + 
		"	<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"		`user_id`," + 
		"		`role_id`," + 
		"		`create_by`," + 
		"		`create_time`" + 
		"	</trim>" + 
		"	<trim prefix='values (' suffix=')' suffixOverrides=','>" + 
		"		#{userId,jdbcType=BIGINT}," + 
		"		#{roleId,jdbcType=BIGINT}," + 
		"		#{createBy,jdbcType=BIGINT}," + 
		"		#{createTime,jdbcType=TIMESTAMP}" + 
		"	</trim>",
		"</script>"
	})
	int insert(RelRoleUser relRoleUser);

	@Insert({
		"<script>",
		"	insert ignore rel_role_user" + 
		"		<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"			`user_id`," + 
		"			`role_id`," + 
		"			`create_by`," + 
		"			`create_time`" + 
		"		</trim>" + 
		"		VALUES" + 
		"		<foreach collection='relRoleUsers' item='record' index='index' separator=','>" + 
		"			<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"				#{record.userId,jdbcType=BIGINT}," + 
		"				#{record.roleId,jdbcType=BIGINT}," + 
		"				#{record.createBy,jdbcType=BIGINT}," + 
		"				#{record.createTime,jdbcType=TIMESTAMP}" + 
		"			</trim>" + 
		"		</foreach>",
		"</script>"
	})
    int insertBatch(@Param("relRoleUsers") List<RelRoleUser> relRoleUsers);

    @Delete({
            "delete from rel_role_user where role_id = #{roleId,jdbcType=BIGINT}"
    })
    int deleteByRoleId(Long roleId);

    @Select({
    	"<script>",
    	"	select * from rel_role_user where user_id in" + 
    	"		<foreach collection='userList' item='item' index='index' open='(' close=')' separator=','>" + 
    	"			#{item}" + 
    	"		</foreach>",
    	"</script>"
    })
    List<RelRoleUser> getByUserIds(@Param("userList") List<Long> userList);

    @Select({
            "select rru.id, u.id as 'user.id', ifnull(u.`name`, u.username) as 'user.username', u.avatar",
            "from rel_role_user rru left join `user` u on u.id = rru.user_id",
            "where rru.role_id = #{id}",
    })
    List<RelRoleMember> getMembersByRoleId(Long id);

    @Select({
    	"<script>",
    	"	select user_id from rel_role_user where role_id = #{roleId} and user_id in" + 
    	"		<foreach collection='userList' item='item' index='index' open='(' close=')' separator=','>" + 
    	"			#{item}" + 
    	"		</foreach>",
    	"</script>"
    })
    List<Long> getUserIdsByIdAndUserIds(@Param("roleId") Long roleId, @Param("userList") List<Long> userList);

    @Select({
            "select user_id from rel_role_user where role_id = #{roleId}"
    })
    List<Long> getUserIdsByRoleId(Long roleId);

    @Delete({
    	"<script>",
    	"	delete from rel_role_user where role_id = #{roleId}" + 
    	"		<if test='userIds != null and userIds.size > 0'>" + 
    	"			and user_id in" + 
    	"			<foreach collection='userIds' item='item' index='index' open='(' close=')' separator=','>" + 
    	"				#{item}" + 
    	"			</foreach>" + 
    	"		</if>" + 
    	"		<if test='userIds == null or userIds.size == 0'>" + 
    	"			and 1=0" + 
    	"		</if>",
    	"</script>"
    })
    int deleteByRoleIdAndUserIds(@Param("roleId") Long roleId, @Param("userIds") List<Long> userIds);
}