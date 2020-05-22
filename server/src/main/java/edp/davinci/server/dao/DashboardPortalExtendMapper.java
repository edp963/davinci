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

import edp.davinci.core.dao.DashboardPortalMapper;
import edp.davinci.core.dao.entity.DashboardPortal;
import edp.davinci.server.dto.dashboard.PortalWithProject;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface DashboardPortalExtendMapper extends DashboardPortalMapper {

    @Update({
            "update dashboard_portal",
            "set `name` = #{name,jdbcType=VARCHAR},",
            "description = #{description,jdbcType=VARCHAR},",
            "project_id = #{projectId,jdbcType=BIGINT},",
            "avatar = #{avatar,jdbcType=VARCHAR},",
            "publish = #{publish,jdbcType=BIT},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(DashboardPortal dashboardPortal);

    @Select({"select id from dashboard_portal where project_id = #{projectId} and name = #{name}"})
    Long getByNameWithProjectId(@Param("name") String name, @Param("projectId") Long projectId);

    @Select({"select * from dashboard_portal where project_id = #{projectId}"})
    List<DashboardPortal> getByProject(@Param("projectId") Long projectId);

    @Select({
            "select ",
            "	dp.*,",
            "	p.id 'project.id',",
            "	p.`name` 'project.name',",
            "	p.description 'project.description',",
            "	p.pic 'project.pic',",
            "	p.org_id 'project.orgid',",
            "	p.user_id 'project.userid',",
            "	p.visibility 'p.visibility'",
            "from",
            "	dashboard_portal dp ",
            "	left join project p on p.id = dp.project_id",
            "where dp.id = #{id}",
    })
    PortalWithProject getPortalWithProjectById(@Param("id") Long id);

    @Delete({"delete from dashboard_portal where project_id = #{projectId}"})
    int deleteByProject(@Param("projectId") Long projectId);
}