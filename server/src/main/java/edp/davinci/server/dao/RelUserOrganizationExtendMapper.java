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

import edp.davinci.core.dao.RelUserOrganizationMapper;
import edp.davinci.core.dao.entity.RelUserOrganization;
import edp.davinci.server.dto.organization.OrganizationMember;
import edp.davinci.server.dto.user.UserBaseInfo;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface RelUserOrganizationExtendMapper extends RelUserOrganizationMapper {

    @Select({"select * from rel_user_organization where user_id = #{userId} and org_id = #{orgId}"})
    RelUserOrganization getRel(@Param("userId") Long userId, @Param("orgId") Long orgId);

    @Delete("delete from rel_user_organization where org_id = #{orgId}")
    int deleteByOrgId(@Param("orgId") Long orgId);

    @Select({
            "select ruo.id, u.id as 'user.id', ",
            "    if(u.`name` is null,u.username,u.`name`) as 'user.username', ",
            "    u.email, u.avatar as 'user.avatar', ruo.role as 'user.role'",
            "from `user` u",
            "left join rel_user_organization ruo on ruo.user_id = u.id",
            "left join organization o on o.id = ruo.org_id",
            "where ruo.org_id = #{orgId}"
    })
    List<OrganizationMember> getOrgMembers(@Param("orgId") Long orgId);

    @Select({
        "<script>",
        "select distinct u.id, if(u.`name` is null, u.`username`, u.`name`) as username, u.`email`, u.`avatar`" +
        "       from `user` u left join rel_user_organization ruo on u.id = ruo.user_id" +
        "       where ruo.org_id = #{orgId}" +
        "       <if test='ids != null and ids.size > 0'>" +
        "       and u.id in" +
        "       <foreach collection='ids' index='index' item='item' open='(' close=')' separator=','>" +
        "       #{item}" +
        "       </foreach>" +
        "       </if>" +
        "       <if test='ids == null or ids.size == 0'>" +
        "       and 1=0" +
        "       </if>",
        "</script>"
        })
    Set<UserBaseInfo> selectOrgMembers(@Param("orgId") Long orgId, @Param("ids") Set<Long> ids);

    @Select({"select * from rel_user_organization where id = #{id}"})
    RelUserOrganization getById(@Param("id") Long id);

    @Delete({"delete from rel_user_organization where id = #{id}"})
    int deleteById(@Param("id") Long id);

    @Update({
            "update rel_user_organization set role = #{role},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id= #{id}"
    })
    int updateMemberRole(RelUserOrganization relUserOrganization);

    @Insert({
    	"<script>",
    	"	insert rel_user_organization" + 
    	"		(`org_id`,`user_id`, `role`, `create_by`, `create_time`)" + 
    	"		VALUES" + 
    	"		<foreach collection='set' item='record' index='index' separator=','>" + 
    	"		(" + 
    	"			#{record.orgId,jdbcType=BIGINT}," + 
    	"			#{record.userId,jdbcType=BIGINT}," + 
    	"			#{record.role,jdbcType=SMALLINT}," + 
    	"			#{record.createBy,jdbcType=BIGINT}," + 
    	"			#{record.createTime,jdbcType=TIMESTAMP}" + 
    	"		)" + 
    	"		</foreach>",
    	"</script>"
    })
    int insertBatch(@Param("set") Set<RelUserOrganization> set);

    @Delete({
    	"<script>",
    	"delete from rel_user_organization where" + 
    	"        <if test='ids != null and ids.size > 0'>" + 
    	"            id in" + 
    	"            <foreach collection='ids' index='index' item='item' open='(' close=')' separator=','>" + 
    	"                #{item}" + 
    	"            </foreach>" + 
    	"        </if>" + 
    	"        <if test='ids == null or ids.size == 0'>" + 
    	"            1=0" + 
    	"        </if>",
    	"</script>"
    })
    int deleteBatch(@Param("ids") Set<Long> ids);
}