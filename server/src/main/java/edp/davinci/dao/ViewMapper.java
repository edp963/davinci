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

import edp.davinci.dto.viewDto.ViewWithProjectAndSource;
import edp.davinci.dto.viewDto.ViewWithSourceBaseInfo;
import edp.davinci.model.View;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface ViewMapper {

    int insert(View view);

    @Select({"select id from view where project_id = #{projectId} and name = #{name}"})
    Long getByNameWithProjectId(@Param("name") String name, @Param("projectId") Long projectId);


    @Select({
            "SELECT ",
            "	v.*,",
            "	p.id 'project.id',",
            "	p.`name` 'project.name',",
            "	p.description 'project.description',",
            "	p.pic 'project.pic',",
            "	p.org_id 'project.orgId',",
            "	p.user_id 'project.userId',",
            "	p.visibility 'p.visibility',",
            "	s.id 'source.id',",
            "	s.`name` 'source.name',",
            "	s.description 'source.description',",
            "	s.config 'source.config',",
            "	s.project_id 'source.projectId',",
            "	s.type 'source.type'",
            "FROM `view` v",
            "	LEFT JOIN project p on p.id = v.project_id",
            "	LEFT JOIN source s on s.id = v.source_id",
            "WHERE v.id = #{id}",
    })
    ViewWithProjectAndSource getViewWithProjectAndSourceById(@Param("id") Long id);


    @Delete({"delete from view where id = #{id}"})
    int deleteById(Long id);

    @Select({"select * from `view` where id = #{id}"})
    View getById(Long id);


    @Update({
            "update view",
            "set `name` = #{name,jdbcType=VARCHAR},",
            "`description` = #{description,jdbcType=VARCHAR},",
            "`project_id` = #{projectId,jdbcType=BIGINT},",
            "`source_id` = #{sourceId,jdbcType=BIGINT},",
            "`sql` = #{sql,jdbcType=LONGVARCHAR},",
            "`model` = #{model,jdbcType=LONGVARCHAR},",
            "`config` = #{config,jdbcType=LONGVARCHAR}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(View view);

    @Select({"select * from view where source_id = #{sourceId}"})
    List<View> getBySourceId(@Param("sourceId") Long sourceId);

    @Select({
            "select v.`id`,v.`name`,v.`description`,v.`project_id`,v.`source_id`,v.`sql`,v.`model`, ",
            "s.id 'source.id', s.name 'source.name' from view v ",
            "left join source s on s.id = v.source_id ",
            "where v.project_id = #{projectId}"
    })
    List<ViewWithSourceBaseInfo> getByProject(@Param("projectId")Long projectId);


    int insertBatch(@Param("list") List<View> sourceList);

    @Delete({"delete from view where project_id = #{projectId}"})
    int deleteByPorject(@Param("projectId") Long projectId);
}