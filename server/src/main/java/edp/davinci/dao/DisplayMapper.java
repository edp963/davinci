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

import edp.davinci.dto.displayDto.DisplayWithProject;
import edp.davinci.model.Display;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface DisplayMapper {

    int insert(Display display);

    @Delete({"delete from display where id = #{id}"})
    int deleteById(@Param("id") Long id);

    @Delete({"delete from display where project_id = #{projectId}"})
    int deleteByProject(@Param("projectId") Long projectId);


    @Select({"select * from display where id = #{id}"})
    Display getById(@Param("id") Long id);


    @Update({
            "update display",
            "set `name` = #{name,jdbcType=VARCHAR},",
            "description = #{description,jdbcType=VARCHAR},",
            "project_id = #{projectId,jdbcType=BIGINT},",
            "avatar = #{avatar,jdbcType=VARCHAR},",
            "publish = #{publish,jdbcType=BIT},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(Display display);


    @Select({
            "SELECT ",
            "	d.*,",
            "	p.id 'project.id',",
            "	p.`name` 'project.name',",
            "	p.description 'project.description',",
            "	p.pic 'project.pic',",
            "	p.org_id 'project.orgId',",
            "	p.user_id 'project.userId',",
            "	p.visibility 'p.visibility'",
            "FROM",
            "	display d ",
            "	LEFT JOIN project p on d.project_id = p.id",
            "WHERE d.id = #{id}",
    })
    DisplayWithProject getDisplayWithProjectById(@Param("id") Long id);

    @Select({"select * from display where project_id = #{projectId}"})
    List<Display> getByProject(@Param("projectId") Long projectId);

    @Select({"select id from display where project_id = #{projectId} and `name` = #{name}"})
    Long getByNameWithProjectId(@Param("name") String name, @Param("projectId") Long projectId);

    @Select({
            "SELECT max(REPLACE(`name`,'${name}','')) ",
            "FROM display WHERE project_id = #{projectId} and `name` REGEXP CONCAT('${name}','[0-9]+')"
    })
    Integer selectMaxNameOrderByName(@Param("name") String name, @Param("projectId") Long projectId);
}