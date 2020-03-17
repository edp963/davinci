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
 */

package edp.davinci.server.dao;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import edp.davinci.core.dao.RelRoleDashboardWidgetMapper;
import edp.davinci.core.dao.entity.RelRoleDashboardWidget;

import java.util.List;
import java.util.Set;

public interface RelRoleDashboardWidgetExtendMapper extends RelRoleDashboardWidgetMapper {

	@Insert({
		"<script>",
		"	replace into rel_role_dashboard_widget" + 
		"		(`role_id`, `mem_dashboard_widget_id`, `visible`, `create_by`, `create_time`)" + 
		"		values" + 
		"		<foreach collection='list' item='record' index='index' separator=','>" + 
		"		(" + 
		"			#{record.roleId,jdbcType=BIGINT}," + 
		"			#{record.memDashboardWidgetId,jdbcType=BIGINT}," + 
		"			#{record.visible,jdbcType=TINYINT}," + 
		"			#{record.createBy,jdbcType=BIGINT}," + 
		"			#{record.createTime,jdbcType=TIMESTAMP}" + 
		"		)" + 
		"		</foreach>",
		"</script>"
	})
    int insertBatch(List<RelRoleDashboardWidget> list);

    @Delete({
    	"<script>",
    	"	delete from rel_role_dashboard_widget where" + 
    	"		<if test='memDashboardWidgetIds != null and memDashboardWidgetIds.size > 0'>" + 
    	"			mem_dashboard_widget_id in" + 
    	"			<foreach collection='memDashboardWidgetIds' index='index' item='item' open='(' close=')' separator=','>" + 
    	"			#{item}" + 
    	"			</foreach>" + 
    	"	</if>" + 
    	"	<if test='memDashboardWidgetIds == null or memDashboardWidgetIds.size == 0'>" + 
    	"		1=0" + 
    	"	</if>",
    	"</script>"
    })
    int deleteByMemDashboardWidgetIds(@Param("memDashboardWidgetIds") Set<Long> memDashboardWidgetIds);

    @Delete({"delete from rel_role_dashboard_widget where mem_dashboard_widget_id = #{memDashboardWidgetId}"})
    int deleteByMemDashboardWidgetId(@Param("memDashboardWidgetId") Long memDashboardWidgetId);

    @Delete({"delete from rel_role_dashboard_widget where role_id = #{roleId}"})
    int deleteByRoleId(@Param("roleId") Long roleId);

    @Delete({"delete rrdw from rel_role_dashboard_widget rrdw where rrdw.mem_dashboard_widget_id in " +
            "( " +
            "select mdw.id " +
            "from mem_dashboard_widget mdw " +
            "inner join dashboard d on d.id = mdw.dashboard_id " +
            "where d.dashboard_portal_id = #{portalId} " +
            ") "})
    int deleteByPortalId(@Param("portalId") Long portalId);

    @Delete({"delete rrdw from rel_role_dashboard_widget rrdw where rrdw.mem_dashboard_widget_id in " +
            "( " +
            "select mdw.id " +
            "from mem_dashboard_widget mdw " +
            "where mdw.dashboard_id = #{dashboardId} " +
            ") "})
    int deleteByDashboardId(@Param("dashboardId") Long dashboardId);

    @Select({
            "select rrdw.mem_dashboard_widget_id " +
                    "from rel_role_dashboard_widget rrdw " +
                    "inner join rel_role_user rru on rru.role_id = rrdw.role_id " +
                    "where rru.user_id = #{userId} and rrdw.visible = 0 "
    })
    List<Long> getDisableByUser(@Param("userId") Long userId);

    @Delete({"delete rrdw from rel_role_dashboard_widget rrdw where rrdw.mem_dashboard_widget_id in " +
            "( " +
            "select mdw.id " +
            "from mem_dashboard_widget mdw " +
            "inner join dashboard d on d.id = mdw.dashboard_id " +
            "inner join dashboard_portal dp on dp.id = d.dashboard_portal_id " +
            "where dp.project_id = #{projectId} " +
            ") "})
    int deleteByProjectId(@Param("projectId") Long projectId);

}