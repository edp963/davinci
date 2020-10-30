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

import edp.davinci.core.dao.WidgetMapper;
import edp.davinci.core.dao.entity.Widget;
import edp.davinci.server.dto.share.SimpleShareWidget;
import edp.davinci.server.dto.widget.WidgetWithRelationDashboardId;
import edp.davinci.server.dto.widget.WidgetWithVizId;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface WidgetExtendMapper extends WidgetMapper {

	@Insert({
		"<script>",
		"	insert into widget" + 
		"		<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"			`name`," + 
		"			<if test='description != null'>" + 
		"				`description`," + 
		"			</if>" + 
		"			`view_id`," + 
		"			`project_id`," + 
		"			`type`," + 
		"			`publish`," + 
		"			`config`," + 
		"			`create_by`," + 
		"			`create_time`" + 
		"		</trim>" + 
		"		values"+
		"		<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"			#{name,jdbcType=VARCHAR}," + 
		"			<if test='description != null'>" + 
		"				#{description,jdbcType=VARCHAR}," + 
		"			</if>" + 
		"			#{viewId,jdbcType=BIGINT}," + 
		"			#{projectId,jdbcType=BIGINT}," + 
		"			#{type,jdbcType=BIGINT}," + 
		"			#{publish,jdbcType=BIT}," + 
		"			#{config,jdbcType=LONGVARCHAR}," + 
		"			#{createBy,jdbcType=BIGINT}," + 
		"			#{createTime,jdbcType=TIMESTAMP}" + 
		"		</trim>",
		"</script>"
	})
	int insert(Widget widget);

	@Select({"select id, name, description, view_id, type, config from widget where id = #{id}"})
	SimpleShareWidget getShareWidgetById(@Param("id") Long id);

    @Insert({
    	"<script>",
    	"	insert ignore into widget" + 
    	"		(`id`,`name`,`description`, view_id, `project_id`, `type`, `publish`,`config`)" + 
    	"		VALUES" + 
    	"		<foreach collection='list' item='record' index='index'" + 
    	"			separator=','>" + 
    	"			#{record.id,jdbcType=BIGINT}," + 
    	"			#{record.name,jdbcType=VARCHAR}," + 
    	"			#{record.description,jdbcType=VARCHAR}," + 
    	"			#{record.viewId,jdbcType=BIGINT}," + 
    	"			#{record.projectId,jdbcType=BIGINT}," + 
    	"			#{record.type,jdbcType=BIGINT}," + 
    	"			#{record.publish,jdbcType=BIT}," + 
    	"			#{record.config,jdbcType=LONGVARCHAR}" + 
    	"		</foreach>",
    	"</script>"
    })
    int insertBatch(@Param("list") List<Widget> list);

    @Update({
            "update widget",
            "set `name` = #{name,jdbcType=VARCHAR},",
            "`description` = #{description,jdbcType=VARCHAR},",
            "`view_id` = #{viewId,jdbcType=BIGINT},",
            "`project_id` = #{projectId,jdbcType=BIGINT},",
            "`type` = #{type,jdbcType=BIGINT},",
            "`publish` = #{publish,jdbcType=BIT},",
            "`config` = #{config,jdbcType=LONGVARCHAR},",
            "`update_by` = #{updateBy,jdbcType=BIGINT},",
            "`update_time` = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(Widget widget);

    @Select({
    	"<script>",
    	"	select * from widget where" + 
    	"		<if test='list != null and list.size > 0'>" + 
    	"			id in" + 
    	"			<foreach collection='list' index='index' item='item' open='('" + 
    	"				close=')' separator=','>" + 
    	"				#{item}" + 
    	"			</foreach>" + 
    	"		</if>" + 
    	"		<if test='list == null or list.size == 0'>" + 
    	"			1=0" + 
    	"		</if>",
    	"</script>"
    })
    List<Widget> getByIds(@Param("list") Set<Long> ids);

    @Select({
    	"<script>",
    	"	select id from widget where id in" + 
    	"		<foreach collection='set' index='index' item='item' open='('" + 
    	"			close=')' separator=','>" + 
    	"			#{item}" + 
    	"		</foreach>",
    	"</script>"
    })
    Set<Long> getIdSetByIds(@Param("set") Set<Long> ids);

    @Select({
        "select w.*, s.id as 'vizId', s.index as 'vizIndex' from widget w ",
        "left join mem_display_slide_widget m on w.id = m.widget_id",
        "left join display_slide s on m.display_slide_id = s.id",
        "where s.display_id = #{displayId} order by m.create_time",
    })
    List<WidgetWithVizId> queryByDisplayId(@Param("displayId") Long displayId);

    @Select({
            "select w.* from widget w ",
            "left join mem_display_slide_widget m on w.id = m.widget_id",
            "left join display_slide s on m.display_slide_id = s.id",
            "where s.display_id = #{displayId}"
    })
    Set<SimpleShareWidget> getShareWidgetsByDisplayId(@Param("displayId") Long displayId);

    @Select({"select id from widget where project_id = #{projectId} and `name` = #{name}"})
    Long getByNameWithProjectId(@Param("name") String name, @Param("projectId") Long projectId);

    @Select({"select * from widget where project_id = #{projectId}"})
    List<Widget> getByProject(@Param("projectId") Long projectId);

    @Select({"select w.*, m.id as 'relationId' from mem_dashboard_widget m left join widget w on w.id = m.widget_id where m.dashboard_id = #{dashboardId} order by m.create_time"})
    List<WidgetWithRelationDashboardId> getByDashboard(@Param("dashboardId") Long dashboardId);

    @Select({
			"select w.* from mem_dashboard_widget m ",
            "left join widget w on w.id = m.widget_id ",
            "where m.dashboard_id = #{dashboardId}"
    })
    Set<SimpleShareWidget> getShareWidgetsByDashboard(@Param("dashboardId") Long dashboardId);

    @Delete({"delete from widget where project_id = #{projectId}"})
    int deleteByProject(@Param("projectId") Long projectId);

    @Select({"select * from widget where view_id = #{viewId}"})
    List<Widget> getWidgetsByView(@Param("viewId") Long viewId);

    @Update({
    	"<script>",
    	"	update widget set `config` =" + 
    	"		<foreach collection='list' item='record' index='index'" + 
    	"			separator=' ' open='case id' close='end'>" + 
    	"			when #{record.id} then #{record.config}" + 
    	"		</foreach>" + 
    	"		where id in" + 
    	"		<foreach collection='list' index='index' item='record'" + 
    	"			separator=',' open='(' close=')'>" + 
    	"			#{record.id,jdbcType=BIGINT}" + 
    	"		</foreach>",
    	"</script>"
    })
    int updateConfigBatch(@Param("list") List<Widget> list);
}