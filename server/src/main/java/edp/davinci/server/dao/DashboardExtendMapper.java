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

import edp.davinci.core.dao.DashboardMapper;
import edp.davinci.core.dao.entity.Dashboard;
import edp.davinci.server.dto.dashboard.DashboardWithPortal;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface DashboardExtendMapper extends DashboardMapper {

    @Delete({"delete from dashboard where find_in_set(#{parentId}, full_parent_Id)"})
    int deleteByParentId(@Param("parentId") Long parentId);

    @Delete({"delete from dashboard where dashboard_portal_id = #{portalId}"})
    int deleteByPortalId(@Param("portalId") Long portalId);

    @Select({"select id from dashboard where dashboard_portal_id = #{portalId} and `name` = #{name}"})
    Long getByNameWithPortalId(@Param("name") String name, @Param("portalId") Long portalId);

    @Update({
            "update dashboard",
            "set `name` = #{name,jdbcType=VARCHAR},",
            "dashboard_portal_id = #{dashboardPortalId,jdbcType=BIGINT},",
            "`type` = #{type,jdbcType=SMALLINT},",
            "`index` = #{index,jdbcType=INTEGER},",
            "parent_id = #{parentId,jdbcType=BIGINT},",
            "`config` = #{config,jdbcType=LONGVARCHAR},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(Dashboard record);

    
	@Update({
		"<script>",
		"		<foreach collection='list' item='item' index='index' open='' close='' separator=';'>" + 
		"            update dashboard" + 
		"            <set>" + 
		"                `name` = #{item.name,jdbcType=VARCHAR}," + 
		"                `dashboard_portal_id` = #{item.dashboardPortalId,jdbcType=BIGINT}," + 
		"                `type` = #{item.type,jdbcType=SMALLINT}," + 
		"                `index` = #{item.index,jdbcType=INTEGER}," + 
		"                `parent_id` = #{item.parentId,jdbcType=BIGINT}," + 
		"                `full_parent_id` = #{item.fullParentId,jdbcType=BIGINT}," + 
		"                `config` = #{item.config,jdbcType=LONGVARCHAR}," + 
		"                `update_by` = #{item.updateBy,jdbcType=BIGINT}," + 
		"                `update_time` = #{item.updateTime,jdbcType=TIMESTAMP}" + 
		"            </set>" + 
		"            <where>" + 
		"                id=#{item.id,jdbcType=BIGINT}" + 
		"            </where>" + 
		"		</foreach>",
		"</script>"
		})
    int updateBatch(@Param("list") List<Dashboard> list);

	@Select({ "select * from dashboard where dashboard_portal_id = #{portalId} order by `index`" })
    List<Dashboard> getByPortalId(@Param("portalId") Long portalId);

	@Select({ "select * from dashboard where parent_id = #{parentId} or id = #{parentId}" })
    List<Dashboard> getByParentId(@Param("parentId") Long parentId);

    @Select({
            "select ",
            "	d.*,",
            "	dp.id 'portal.id',",
            "	dp.`name` 'portal.name',",
            "	dp.description 'portal.description',",
            "	dp.project_id 'portal.projectid',",
            "	dp.avatar 'portal.avatar',",
            "	dp.publish 'portal.publish',",
            "	p.id 'project.id',",
            "	p.`name` 'project.name',",
            "	p.description 'project.description',",
            "	p.pic 'project.pic',",
            "	p.org_id 'project.orgid',",
            "	p.user_id 'project.userid',",
            "	p.visibility 'p.visibility'",
            "from dashboard d ",
            "left join dashboard_portal dp on dp.id = d.dashboard_portal_id",
            "left join project p on p.id = dp.project_id",
            "where d.id = #{dashboardId}"
    })
    DashboardWithPortal getDashboardWithPortalAndProject(@Param("dashboardId") Long dashboardId);

    @Delete({"delete from dashboard where dashboard_portal_id in (select id from dashboard_portal where project_id = #{projectId})"})
    int deleteByProject(@Param("projectId") Long projectId);

    @Select({"select full_parent_id from dashboard where id = #{id}"})
    String getFullParentId(Long id);

    @Select({
    	"<script>",
    	"		select `id`, `full_parent_Id` from dashboard" + 
    	"        <if test='parentIds != null and parentIds.size > 0'>" + 
    	"            where `id` in" + 
    	"            <foreach collection='parentIds' index='index' item='item' open='(' close=')' separator=','>" + 
    	"                #{item}" + 
    	"            </foreach>" + 
    	"        </if>" + 
    	"        <if test='parentIds == null or parentIds.size == 0'>" + 
    	"            where 1=0" + 
    	"        </if>",
		"</script>"
    })
    List<Dashboard> queryByParentIds(@Param("parentIds") Set<Long> parentIds);

    @Select({
    	"<script>",
    	"        select `id` from dashboard" + 
    	"        <if test='set != null and set.size > 0'>" + 
    	"            where `id` in" + 
    	"            <foreach collection='set' index='index' item='item' open='(' close=')' separator=','>" + 
    	"                #{item}" + 
    	"            </foreach>" + 
    	"        </if>" + 
    	"        <if test='set == null or set.size == 0'>" + 
    	"            where 1=0" + 
    	"        </if>",
		"</script>"
    })
    Set<Long> getIdSetByIds(@Param("set") Set<Long> dashboardIds);

	@Select({ "select * from dashboard where type = 1 and find_in_set(#{id},full_parent_Id)" })
    List<Dashboard> getSubDashboardById(@Param("id") Long id);

    @Select({
    	"<script>",
    	"        select * from dashboard where" + 
    	"        <if test='set != null and set.size > 0'>" + 
    	"            <foreach collection='set' index='index' item='item' open='(' close=')' separator='or'>" + 
    	"                find_in_set(#{item},full_parent_Id) or id = #{item}" + 
    	"            </foreach>" + 
    	"        </if>" + 
    	"        <if test='set == null or set.size == 0'>" + 
    	"             1=0" + 
    	"        </if>",
		"</script>"
    })
    Set<Dashboard> queryDashboardsByIds(@Param("set") Set<Long> dashboardIds);

    @Select({
    	"<script>",
    	"        select * from dashboard where" + 
    	"        <if test='set != null and set.size > 0'>" + 
    	"            `dashboard_portal_id` in" + 
    	"            <foreach collection='set' index='index' item='item' open='(' close=')' separator=','>" + 
    	"                #{item}" + 
    	"            </foreach>" + 
    	"        </if>" + 
    	"        <if test='set == null or set.size == 0'>" + 
    	"            1=0" + 
    	"        </if>",
		"</script>"
    })
    Set<Dashboard> queryByPortals(@Param("set") Set<Long> portalIds);
}