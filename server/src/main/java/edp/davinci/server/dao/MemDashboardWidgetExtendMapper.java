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

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import edp.davinci.core.dao.MemDashboardWidgetMapper;
import edp.davinci.core.dao.entity.MemDashboardWidget;

import java.util.List;

@Component
public interface MemDashboardWidgetExtendMapper extends MemDashboardWidgetMapper {

    @Update({
            "update mem_dashboard_widget",
            "set alias = #{alias,jdbcType=VARCHAR},",
            "dashboard_id = #{dashboardId,jdbcType=BIGINT},",
            "widget_Id = #{widgetId,jdbcType=BIGINT},",
            "x = #{x,jdbcType=INTEGER},",
            "y = #{y,jdbcType=INTEGER},",
            "width = #{width,jdbcType=INTEGER},",
            "height = #{height,jdbcType=INTEGER},",
            "polling = #{polling,jdbcType=BIT},",
            "frequency = #{frequency,jdbcType=INTEGER},",
            "`config` = #{config,jdbcType=LONGVARCHAR}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(MemDashboardWidget memDashboardWidget);

    @Select({"select * from mem_dashboard_widget where dashboard_id = #{dashboardId}"})
    List<MemDashboardWidget> getByDashboardId(@Param("dashboardId") Long dashboardId);

    @Delete({
            "delete from mem_dashboard_widget where dashboard_id in ",
            "(select d.id from dashboard d left join dashboard_portal p on d.dashboard_portal_id = p.id where p.project_id = #{projectId})"
    })
    int deleteByProject(@Param("projectId") Long projectId);

    @Insert({
    	"<script>",
    	"	insert into mem_dashboard_widget" + 
    	"		(`dashboard_id`,`widget_Id`,`x`,`y`,`width`,`height`,`frequency`,`polling`,`create_by`,`create_time`)" + 
    	"			values " + 
    	"		<foreach collection='list' item='record' index='index' separator=','>" + 
    	"			(" + 
    	"			#{record.dashboardId,jdbcType=BIGINT}," + 
    	"			#{record.widgetId,jdbcType=BIGINT}," + 
    	"			#{record.x,jdbcType=INTEGER}," + 
    	"			#{record.y,jdbcType=INTEGER}," + 
    	"			#{record.width,jdbcType=INTEGER}," + 
    	"			#{record.height,jdbcType=INTEGER}," + 
    	"			#{record.frequency,jdbcType=INTEGER}," + 
    	"			#{record.polling,jdbcType=BIT}," + 
    	"			#{record.createBy,jdbcType=BIGINT}," + 
    	"			#{record.createTime,jdbcType=TIMESTAMP}" + 
    	"			)" + 
    	"		</foreach>",
    	"</script>"
    })
    int insertBatch(@Param("list") List<MemDashboardWidget> list);

    @Update({
    	"<script>",
    	"	<foreach collection='list' item='item' index='index' open='' close='' separator=';'>" + 
    	"		update mem_dashboard_widget" + 
    	"		<set>" + 
    	"			`dashboard_id` = #{item.dashboardId,jdbcType=BIGINT}," + 
    	"			`widget_Id` = #{item.widgetId,jdbcType=BIGINT}," + 
    	"			`x` = #{item.x,jdbcType=INTEGER}," + 
    	"			`y` = #{item.y,jdbcType=INTEGER}," + 
    	"			`width` = #{item.width,jdbcType=INTEGER}," + 
    	"			`height` = #{item.height,jdbcType=INTEGER}," + 
    	"			`polling` = #{item.polling,jdbcType=BIT}," + 
    	"			`frequency` = #{item.frequency,jdbcType=INTEGER}," + 
    	"			`config` = #{item.config,jdbcType=LONGVARCHAR}," + 
    	"			`update_by` = #{item.updateBy,jdbcType=BIGINT}," + 
    	"			`update_time` = #{item.updateTime,jdbcType=TIMESTAMP}" + 
    	"		</set>" + 
    	"		<where>" + 
    	"			`id` = #{item.id,jdbcType=BIGINT}" + 
    	"		</where>" + 
    	"	</foreach>",
    	"</script>"
    })
    int updateBatch(List<MemDashboardWidget> list);

    @Delete("delete from mem_dashboard_widget where widget_Id = #{widgetId}")
    int deleteByWidget(@Param("widgetId") Long widgetId);

    @Delete({"delete mdw from mem_dashboard_widget mdw where mdw.dashboard_id in " +
            "( " +
            "select d.id " +
            "from dashboard d " +
            "where d.dashboard_portal_id = #{portalId} " +
            ") "})
    int deleteByPortalId(@Param("portalId") Long portalId);

    @Delete("delete from mem_dashboard_widget where dashboard_id = #{dashboardId}")
    int deleteByDashboardId(@Param("dashboardId") Long dashboardId);
}