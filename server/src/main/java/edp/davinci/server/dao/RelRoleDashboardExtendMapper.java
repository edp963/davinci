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

import edp.davinci.core.dao.RelRoleDashboardMapper;
import edp.davinci.core.dao.entity.RelRoleDashboard;
import edp.davinci.server.model.RoleDisableViz;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Set;

public interface RelRoleDashboardExtendMapper extends RelRoleDashboardMapper {

	@Insert({
		"<script>",
		"	insert ignore rel_role_dashboard" + 
		"		<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"			`role_id`," + 
		"			`dashboard_id`," + 
		"			`visible`," + 
		"			`create_by`," + 
		"			`create_time`" + 
		"		</trim>" + 
		"		<trim prefix='values (' suffix=')' suffixOverrides=','>" + 
		"			#{roleId,jdbcType=BIGINT}," + 
		"			#{dashboardId,jdbcType=BIGINT}," + 
		"			#{visible,jdbcType=TINYINT}," + 
		"			#{createBy,jdbcType=BIGINT}," + 
		"			#{createTime,jdbcType=TIMESTAMP}" + 
		"		</trim>",
		"</script>"
	})
    int insert(RelRoleDashboard relRoleDashboard);

	@Insert({
		"<script>",
		"	replace into rel_role_dashboard" + 
		"		(`role_id`, `dashboard_id`, `visible`, `create_by`, `create_time`)" + 
		"		values" + 
		"		<foreach collection='list' item='record' index='index' separator=','>" + 
		"		(" + 
		"			#{record.roleId,jdbcType=BIGINT}," + 
		"			#{record.dashboardId,jdbcType=BIGINT}," + 
		"			#{record.visible,jdbcType=TINYINT}," + 
		"			#{record.createBy,jdbcType=BIGINT}," + 
		"			#{record.createTime,jdbcType=TIMESTAMP}" + 
		"		)" + 
		"		</foreach>",
		"</script>"
	})
	int insertBatch(List<RelRoleDashboard> list);
    
	@Delete({
		"<script>",
		"	delete from rel_role_dashboard where" + 
		"		<if test='dashboardIds != null and dashboardIds.size > 0'>" + 
		"		dashboard_id in" + 
		"		<foreach collection='dashboardIds' index='index' item='item' open='(' close=')' separator=','>" + 
		"			#{item}" + 
		"		</foreach>" + 
		"		</if>" + 
		"		<if test='dashboardIds == null or dashboardIds.size == 0'>" + 
		"			1=0" + 
		"		</if>",
		"</script>"
	})
    int deleteByDashboardIds(@Param("dashboardIds") Set<Long> dashboardIds);

    @Select({
            "select rru.role_id as roleId, rrd.dashboard_id as vizId",
            "from rel_role_dashboard rrd",
            "   inner join rel_role_user rru on rru.role_id = rrd.role_id",
            "   inner join dashboard d on d.id  = rrd.dashboard_id",
            "where rru.user_id = #{userId} and rrd.visible = 0 and d.dashboard_portal_id = #{portalId}"
    })
    List<RoleDisableViz> getDisableByUser(@Param("userId") Long userId, @Param("portalId") Long portalId);

    @Select("select role_id from rel_role_dashboard where dashboard_id = #{dashboardId} and visible = 0")
    List<Long> getExcludeRoles(@Param("dashboardId") Long dashboardId);

    @Delete({
            "delete from rel_role_dashboard where dashboard_id in (select id from dashboard where id = #{dashboardId} or find_in_set(#{dashboardId}, full_parent_Id) > 0)"
    })
    int deleteByDashboardId(Long dashboardId);

    @Select({
            "select rrd.dashboard_id",
            "from rel_role_dashboard rrd",
            "inner join dashboard d on d.id = rrd.dashboard_id",
            "inner join dashboard_portal p on p.id = d.dashboard_portal_id",
            "where rrd.role_id = #{roleId} and rrd.visible = 0 and p.project_id = #{projectId}"
    })
    List<Long> getExcludeDashboards(@Param("roleId") Long roleId, @Param("projectId") Long projectId);

    @Delete({"delete from rel_role_dashboard where role_id = #{roleId}"})
    int deleteByRoleId(Long roleId);

    @Delete({"delete rrd from rel_role_dashboard rrd where rrd.dashboard_id in " +
            "( " +
            "select d.id " +
            "from dashboard d " +
            "where d.dashboard_portal_id = #{portalId} " +
            ") "})
    int deleteByPortalId(@Param("portalId") Long portalId);

    @Delete({
            "delete from rel_role_dashboard where dashboard_id in (",
            "select d.id from dashboard d left join dashboard_portal p on p.id = d.dashboard_portal_id ",
            "where p.project_id = #{projectId})"
    })
	int deleteByProject(Long projectId);
	
	@Delete({
		"delete from rel_role_dashboard where role_id = #{roleId} and dashboard_id in (",
		"select d.id from dashboard d left join dashboard_portal p on p.id = d.dashboard_portal_id ",
		"where p.project_id = #{projectId})"
    })
    int deleteByRoleAndProject(Long roleId, Long projectId);
}