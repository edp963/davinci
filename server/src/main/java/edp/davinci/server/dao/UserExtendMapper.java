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

import edp.davinci.core.dao.UserMapper;
import edp.davinci.core.dao.entity.User;
import edp.davinci.server.dto.user.UserBaseInfo;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface UserExtendMapper extends UserMapper {

	@Insert({
		"<script>",
		"insert `user`" + 
		"	<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"		`email`," + 
		"		`username`," + 
		"		`password`," + 
		"		`admin`," + 
		"		`active`," + 
		"		`create_time`," + 
		"		`create_by`," + 
		"		<if test='name != null and name != \"\" '>" + 
		"			`name`," + 
		"		</if>" + 
		"		<if test='description != null and description != \"\" '>" + 
		"			`description`," + 
		"		</if>" + 
		"		<if test='department != null and department != \"\" '>" + 
		"			`department`," + 
		"		</if>" + 
		"		<if test='avatar != null and avatar != \"\" '>" + 
		"			`avatar`" + 
		"		</if>" + 
		"	</trim>" + 
		"	values" + 
		"	<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"		#{email, jdbcType=VARCHAR}," + 
		"		#{username, jdbcType=VARCHAR}," + 
		"		#{password, jdbcType=VARCHAR}," + 
		"		#{admin, jdbcType=TINYINT}," + 
		"		#{active, jdbcType=TINYINT}," + 
		"		#{createTime, jdbcType=TIMESTAMP}," + 
		"		#{createBy, jdbcType=BIGINT}," + 
		"		<if test='name != null and name != \"\" '>" + 
		"			#{name, jdbcType=VARCHAR}," + 
		"		</if>" + 
		"		<if test='description != null and description != \"\" '>" + 
		"			#{description, jdbcType=VARCHAR}," + 
		"		</if>" + 
		"		<if test='department != null and department != \"\" '>" + 
		"			#{department, jdbcType=VARCHAR}," + 
		"		</if>" + 
		"		<if test='avatar != null and avatar != \"\" '>" + 
		"			#{avatar, jdbcType=VARCHAR}" + 
		"		</if>" + 
		"	</trim>",
		"</script>"
	})
	int insert(User user);

    @Select({"select * from `user` where `username` = #{username} or `email` = #{username} or `name` = #{username}"})
    User selectByUsername(@Param("username") String username);

    @Select({"select * from `user` where `email` = #{email}"})
    User selectByEmail(@Param("email") String email);

    @Select({
    	"<script>",
    	"	select distinct u.id, if(u.`name` is null,u.`username`,u.`name`) as username, u.`email`, u.`avatar`" + 
    	"		from `user` u" + 
    	"		left join rel_user_organization r on r.user_id = u.id" + 
    	"		where" + 
    	"			<if test='orgId != null and orgId > 0 '>" + 
    	"				r.org_id = #{orgId} and" + 
    	"			</if>" + 
    	"		lower(`username`) like concat(concat('%', lower(#{keyword})), '%')" + 
    	"		or lower(`name`) like concat(concat('%', lower(#{keyword})), '%')" + 
    	"		or lower(`email`) like concat(concat('%', lower(#{keyword})), '%')",
    	"</script>"
    })
    List<UserBaseInfo> getUsersByKeyword(@Param("keyword") String keyword, @Param("orgId") Long orgId);

    @Update({"update `user` set `name` = #{name}, description = #{description}, department = #{department}, update_time = #{updateTime}",
            "where id = #{id}"})
    int updateBaseInfo(User user);

    @Update({"update user set `avatar` = #{avatar}, update_time = #{updateTime}  where id = #{id}"})
    int updateAvatar(User user);

    @Select({"select id from user where (LOWER(`username`) = LOWER(#{name}) or LOWER(`email`) = LOWER(#{name}) or LOWER(`name`) = LOWER(#{name}))"})
    Long getIdByName(@Param("name") String name);

    @Update({"update `user` set `active` = #{active}, `update_time` = #{updateTime}  where id = #{id}"})
    int activeUser(User user);

    @Update({"update `user` set `password` = #{password}, `update_time` = #{updateTime}  where id = #{id}"})
    int changePassword(User user);

    @Select({
    	"<script>",
    	"	select * from `user` where" + 
    	"		<if test='userIds != null and userIds.size > 0'>" + 
    	"			id in" + 
    	"			<foreach collection='userIds' index='index' item='item' open='(' close=')' separator=','>" + 
    	"				#{item}" + 
    	"			</foreach>" + 
    	"		</if>" + 
    	"		<if test='userIds == null or userIds.size == 0'>" + 
    	"			1=0" + 
    	"		</if>",
    	"</script>"
    })
    List<User> getByIds(@Param("userIds") List<Long> userIds);

    @Select({"select count(id) from `user` where `email` = #{email}"})
    boolean existEmail(@Param("email") String email);

    @Select({"select count(id) from `user` where `username` = #{username}"})
    boolean existUsername(@Param("username") String username);

}