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

import edp.davinci.core.dao.SourceMapper;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.server.dto.source.SourceWithProject;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface SourceExtendMapper extends SourceMapper {

	@Insert({
		"<script>",
		"	insert into source" + 
		"		<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"			`name`," + 
		"			`description`," + 
		"			`type`," + 
		"			`project_id`," + 
		"			`config`," + 
		"			`create_by`," + 
		"			`create_time`," + 
		"			`parent_id`," + 
		"			`full_parent_id`," + 
		"			`is_folder`," + 
		"			`index`" + 
		"		</trim>" + 
		"		<trim prefix='values (' suffix=')' suffixOverrides=','>" + 
		"			#{name,jdbcType=VARCHAR}," + 
		"			#{description,jdbcType=VARCHAR}," + 
		"			#{type,jdbcType=VARCHAR}," + 
		"			#{projectId,jdbcType=BIGINT}," + 
		"			#{config,jdbcType=VARCHAR}," + 
		"			#{createBy,jdbcType=BIGINT}," + 
		"			#{createTime,jdbcType=TIMESTAMP}," + 
		"			#{parentId,jdbcType=BIGINT}," + 
		"			#{fullParentId,jdbcType=VARCHAR}," + 
		"			#{isFolder,jdbcType=TINYINT}," + 
		"			#{index,jdbcType=INTEGER}," + 
		"        </trim>",
		"</script>"
	})
    int insert(Source source);

    @Update({
            "update `source` set ",
            "`name` = #{name,jdbcType=VARCHAR},",
            "`description` = #{description,jdbcType=VARCHAR},",
            "`type` = #{type,jdbcType=VARCHAR},",
            "`project_id` = #{projectId,jdbcType=BIGINT},",
            "`config` = #{config,jdbcType=VARCHAR},",
            "`update_by` = #{updateBy,jdbcType=BIGINT},",
            "`update_time` = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(Source source);

    @Select({"select id from `source` where project_id = #{projectId} and name = #{name}"})
    Long getByNameWithProject(@Param("name") String name, @Param("projectId") Long projectId);

    @Select({"select * from `source` where project_id = #{projectId}"})
    List<Source> getByProject(@Param("projectId") Long projectId);

    @Select({
            "select s.id, s.`name`, s.`type`, s.`config`,",
            "	p.id 'project.id',",
            "	p.`name` 'project.name',",
            "	p.`description` 'project.description',",
            "	p.`pic` 'project.pic',",
            "	p.`user_id` 'project.userid',",
            "	p.`org_id` 'project.orgid',",
            "	p.`visibility` 'p.visibility'",
            "from source s inner join project p on p.id = s.project_id",
            "where s.id = #{souceId}"
    })
    SourceWithProject getSourceWithProjectById(@Param("souceId") Long souceId);

    @Delete({"delete from `source` where project_id = #{projectId}"})
    int deleteByProject(@Param("projectId") Long projectId);
}