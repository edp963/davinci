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

package edp.davinci.dao;

import edp.davinci.dto.shareDto.SimpleShareWidget;
import edp.davinci.dto.widgetDto.WidgetWithRelationDashboardId;
import edp.davinci.dto.widgetDto.WidgetWithVizId;
import edp.davinci.model.Widget;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface WidgetMapper {
    int insert(Widget widget);

    @Delete({"delete from widget where id = #{id}"})
    int deleteById(@Param("id") Long id);

    @Select({"select * from widget where id = #{id}"})
    Widget getById(@Param("id") Long id);

    @Select({"select id, name, description, view_id, type, config from widget where id = #{id}"})
    SimpleShareWidget getShareWidgetById(@Param("id") Long id);

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

    List<Widget> getByIds(@Param("list") Set<Long> ids);

    Set<Long> getIdSetByIds(@Param("set") Set<Long> ids);

    @Select({
            "SELECT  w.*, s.id as 'vizId', s.index as 'vizIndex' FROM widget w ",
            "LEFT JOIN mem_display_slide_widget m on w.id = m.widget_id",
            "LEFT JOIN display_slide s on m.display_slide_id = s.id",
            "WHERE s.display_id = #{displayId} order by m.create_time",
    })
    List<WidgetWithVizId> queryByDisplayId(@Param("displayId") Long displayId);

    @Select({
            "SELECT  w.* FROM widget w ",
            "LEFT JOIN mem_display_slide_widget m on w.id = m.widget_id",
            "LEFT JOIN display_slide s on m.display_slide_id = s.id",
            "WHERE s.display_id = #{displayId}"
    })
    Set<SimpleShareWidget> getShareWidgetsByDisplayId(@Param("displayId") Long displayId);

    @Select({"select id from widget where project_id = #{projectId} and `name` = #{name}"})
    Long getByNameWithProjectId(@Param("name") String name, @Param("projectId") Long projectId);

    @Select({"select * from widget where project_id = #{projectId}"})
    List<Widget> getByProject(@Param("projectId") Long projectId);

    @Select({"SELECT w.*, m.id as 'relationId' FROM mem_dashboard_widget m LEFT JOIN widget w on w.id = m.widget_Id WHERE m.dashboard_id = #{dashboardId} order by m.create_time"})
    List<WidgetWithRelationDashboardId> getByDashboard(@Param("dashboardId") Long dashboardId);

    @Select({"SELECT w.* FROM mem_dashboard_widget m ",
            "LEFT JOIN widget w on w.id = m.widget_Id ",
            "WHERE m.dashboard_id = #{dashboardId}"})
    Set<SimpleShareWidget> getShareWidgetsByDashboard(@Param("dashboardId") Long dashboardId);

    @Delete({"delete from widget where project_id = #{projectId}"})
    int deleteByProject(@Param("projectId") Long projectId);

    @Select({"select * from widget where view_id = #{viewId}"})
    List<Widget> getWidgetsByWiew(@Param("viewId") Long viewId);

    int updateConfigBatch(@Param("list") List<Widget> list);
}