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

import edp.davinci.core.dao.ViewMapper;
import edp.davinci.core.dao.entity.View;
import edp.davinci.server.dto.view.ViewBaseInfo;
import edp.davinci.server.dto.view.ViewWithProjectAndSource;
import edp.davinci.server.dto.view.ViewWithSource;
import edp.davinci.server.dto.view.ViewWithSourceBaseInfo;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface ViewExtendMapper extends ViewMapper {

	@Insert({
		"<script>",
		"	insert into `view`" + 
		"		<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"			`name`," + 
		"			`project_id`," + 
		"			<if test='description != null'>" + 
		"				description," + 
		"			</if>" + 
		"			<if test='sql != null'>" + 
		"				`sql`," + 
		"			</if>" + 
		"			<if test='model != null'>" + 
		"				`model`," + 
		"			</if>" + 
		"			<if test='variable != null'>" + 
		"				`variable`," + 
		"			</if>" + 
		"			<if test='config != null'>" + 
		"				`config`," + 
		"			</if>" + 
		"			`source_id`," + 
		"			`create_by`," + 
		"			`create_time`" + 
		"		</trim>" + 
		"		<trim prefix='values (' suffix=')' suffixOverrides=','>" + 
		"			#{name,jdbcType=VARCHAR}," + 
		"			#{projectId,jdbcType=BIGINT}," + 
		"			<if test='description != null'>" + 
		"				#{description,jdbcType=VARCHAR}," + 
		"			</if>" + 
		"			<if test='sql != null'>" + 
		"				#{sql,jdbcType=LONGVARCHAR}," + 
		"			</if>" + 
		"			<if test='model != null'>" + 
		"				#{model,jdbcType=LONGVARCHAR}," + 
		"			</if>" + 
		"			<if test='variable != null'>" + 
		"				#{variable,jdbcType=LONGVARCHAR}," + 
		"			</if>" + 
		"			<if test='config != null'>" + 
		"				#{config,jdbcType=LONGVARCHAR}," + 
		"			</if>" + 
		"			#{sourceId,jdbcType=BIGINT}," + 
		"			#{createBy,jdbcType=BIGINT}," + 
		"			#{createTime,jdbcType=TIMESTAMP}" + 
		"		</trim>",
		"</script>"
	})
    int insert(View view);

    @Select({"select id from `view` where project_id = #{projectId} and `name` = #{name}"})
    Long getByNameWithProjectId(@Param("name") String name, @Param("projectId") Long projectId);

    ViewWithProjectAndSource getViewWithProjectAndSourceById(@Param("id") Long id);

    ViewWithProjectAndSource getViewWithProjectAndSourceByWidgetId(@Param("widgetId") Long widgetId);

    @Update({
            "update `view`",
            "set `name` = #{name,jdbcType=VARCHAR},",
            "`description` = #{description,jdbcType=VARCHAR},",
            "`project_id` = #{projectId,jdbcType=BIGINT},",
            "`source_id` = #{sourceId,jdbcType=BIGINT},",
            "`sql` = #{sql,jdbcType=LONGVARCHAR},",
            "`model` = #{model,jdbcType=LONGVARCHAR},",
            "`variable` = #{variable,jdbcType=LONGVARCHAR},",
            "`config` = #{config,jdbcType=LONGVARCHAR},",
            "`update_by` = #{updateBy,jdbcType=BIGINT},",
            "`update_time` = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(View view);

    @Select({"select * from `view` where source_id = #{sourceId}"})
    List<View> getBySourceId(@Param("sourceId") Long sourceId);

    @Select({
            "select v.*,",
            "s.id as 'source.id', s.`name` as 'source.name' from `view` v ",
            "left join source s on s.id = v.source_id ",
            "where v.id = #{id}"
    })
    ViewWithSourceBaseInfo getViewWithSourceBaseInfo(@Param("id") Long id);

    @Select({
            "select v.id, v.`name`, v.`description`, s.name as 'sourceName'",
            "from `view` v ",
            "left join source s on s.id = v.source_id ",
            "where v.project_id = #{projectId}"
    })
    List<ViewBaseInfo> getViewBaseInfoByProject(@Param("projectId") Long projectId);

    @Insert({
    	"<script>",
    	"	insert into `view`" + 
    	"		(`id`,`name`,description, source_id, `project_id`, `sql`, `model`,`variable`,`config`)" + 
    	"		values" + 
    	"		<foreach collection='list' item='record' index='index' separator=','>" + 
    	"			(" + 
    	"			#{record.id,jdbcType=BIGINT}," + 
    	"			#{record.name,jdbcType=VARCHAR}," + 
    	"			#{record.description,jdbcType=VARCHAR}," + 
    	"			#{record.sourceId,jdbcType=BIGINT}," + 
    	"			#{record.projectId,jdbcType=BIGINT}," + 
    	"			#{record.sql,jdbcType=LONGVARCHAR}," + 
    	"			#{record.model,jdbcType=LONGVARCHAR}," + 
    	"			#{record.variable,jdbcType=LONGVARCHAR}," + 
    	"			#{record.config,jdbcType=LONGVARCHAR}" + 
    	"			)" + 
    	"		</foreach>",
    	"</script>"
    })
    int insertBatch(@Param("list") List<View> sourceList);

    @Delete({"delete from `view` where project_id = #{projectId}"})
    int deleteByProject (@Param("projectId") Long projectId);

    @Select({
            "select ",
            "	v.*,",
            "	s.`id` 'source.id',",
            "	s.`name` 'source.name',",
            "	s.`description` 'source.description',",
            "	s.`config` 'source.config',",
            "	s.`project_id` 'source.projectId',",
            "	s.`type` 'source.type'",
            "from `view` v",
            "	left join project p on p.id = v.project_id",
            "	left join source s on s.id = v.source_id",
            "where v.id = #{id}",
    })
    ViewWithSource getViewWithSource(Long id);

    @Select({
    	"<script>",
    	"	select * from `view` where id in" + 
    	"		(" + 
    	"		select view_id from widget where" + 
    	"		<if test='widgetIds != null and widgetIds.size > 0'>" + 
    	"			id in" + 
    	"			<foreach collection='widgetIds' index='index' item='item'" + 
    	"				open='(' close=')' separator=','>" + 
    	"				#{item}" + 
    	"			</foreach>" + 
    	"		</if>" + 
    	"		<if test='widgetIds == null or widgetIds.size == 0'>" + 
    	"			1=0" + 
    	"		</if>" + 
    	"		);",
    	"</script>"
    })
    Set<View> selectByWidgetIds(@Param("widgetIds") Set<Long> widgetIds);
}