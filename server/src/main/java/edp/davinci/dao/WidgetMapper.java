/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.dao;

import edp.davinci.dto.widgetDto.WidgetWithProjectAndView;
import edp.davinci.model.Widget;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Set;

@Component
public interface WidgetMapper {
    int insert(Widget widget);

    @Delete({"delete from widget where id = #{id}"})
    int deleteById(@Param("id") Long id);

    @Select({"select * from widget where id = #{id}"})
    Widget getById(@Param("id") Long id);


    int insertBatch(@Param("list") List<Widget> list);


    @Update({
            "update widget",
            "set name = #{name,jdbcType=VARCHAR},",
            "description = #{description,jdbcType=VARCHAR},",
            "view_id = #{viewId,jdbcType=BIGINT},",
            "project_id = #{projectId,jdbcType=BIGINT},",
            "type = #{type,jdbcType=BIGINT},",
            "publish = #{publish,jdbcType=BIT},",
            "config = #{config,jdbcType=LONGVARCHAR}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(Widget widget);

    List<Widget> getByIds(@Param("list") Set<Long> ids);


    @Select({
            "SELECT  w.* FROM widget w ",
            "LEFT JOIN mem_display_slide_widget m on w.id = m.widget_id",
            "LEFT JOIN display_slide s on m.display_slide_id = s.id",
            "WHERE s.display_id = #{displayId}",
    })
    Set<Widget> getByDisplayId(@Param("displayId") Long displayId);

    @Select({"select id from widget where project_id = #{projectId} and name = #{name}"})
    Long getByNameWithProjectId(@Param("name") String name, @Param("projectId") Long projectId);

    @Select({"select * from widget where project_id = #{projectId}"})
    List<Widget> getByProject(@Param("projectId") Long projectId);


    @Select({
        "SELECT ",
        "	w.*,",
        "	p.id 'project.id',",
        "	p.`name` 'project.name',",
        "	p.description 'project.description',",
        "	p.pic 'project.pic',",
        "	p.org_id 'project.orgId',",
        "	p.user_id 'project.userId',",
        "	p.visibility 'p.visibility',",
        "	v.id 'view.id',",
        "	v.`name` 'view.name',",
        "	v.description 'view.description',",
        "	v.project_id 'view.projectId',",
        "	v.source_id 'view.sourceId',",
        "	v.`sql` 'view.sql',",
        "	v.model 'view.model',",
        "	v.config 'view.config'",
        "FROM",
        "	widget w ",
        "	LEFT JOIN project p on w.project_id = p.id",
        "	LEFT JOIN `view` v on w.view_id = v.id",
        "WHERE w.id = #{id}",
    })
    WidgetWithProjectAndView getWidgetWithProjectAndViewById(@Param("id") Long id);

    @Select({"SELECT w.* FROM mem_dashboard_widget m LEFT JOIN widget w on w.id = m.widget_Id WHERE m.dashboard_id = #{dashboardId}"})
    Set<Widget> getByDashboard(@Param("dashboardId") Long dashboardId);

    @Delete({"delete from widget where project_id = #{projectId}"})
    int deleteByProject(@Param("projectId") Long projectId);

    @Select({"select * from widget where view_id = #{viewId}"})
    List<Widget> getWidgetsByWiew(@Param("viewId") Long viewId);
}