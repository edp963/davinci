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

import edp.davinci.core.dao.DisplaySlideMapper;
import edp.davinci.core.dao.entity.DisplaySlide;
import edp.davinci.server.dto.display.SlideWithDisplayAndProject;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface DisplaySlideExtendMapper extends DisplaySlideMapper {

    @Delete({"delete from display_slide where display_id in (select id from display where project_id = #{projectId})"})
    int deleteByProjectId(@Param("projectId") Long projectId);

    @Update({
            "update display_slide",
            "set display_id = #{displayId,jdbcType=BIGINT},",
            "`index` = #{index,jdbcType=INTEGER},",
            "`config` = #{config,jdbcType=LONGVARCHAR},",
            "`update_by` = #{updateBy,jdbcType=BIGINT},",
            "`update_time` = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(DisplaySlide record);

	@Update({
		"<script>",
		"		<foreach collection='list' item='item' index='index' open='' close='' separator=';'>" + 
		"            update display_slide" + 
		"            <set>" + 
		"                display_id = #{item.displayId,jdbcType=BIGINT}," + 
		"                `index` = #{item.index,jdbcType=INTEGER}," + 
		"                config = #{item.config,jdbcType=VARCHAR}," + 
		"                create_by = #{item.createBy,jdbcType=BIGINT}," + 
		"                create_time = #{item.createTime,jdbcType=TIMESTAMP}," + 
		"                update_by = #{item.updateBy,jdbcType=BIGINT}," + 
		"                update_time = #{item.updateTime,jdbcType=TIMESTAMP}" + 
		"            </set>" + 
		"            <where>" + 
		"                id=#{item.id,jdbcType=BIGINT}" + 
		"            </where>" + 
		"		</foreach>",
		"</script>"
		})
    int updateBatch(List<DisplaySlide> list);

    @Select({"select * from display_slide where display_id = #{displayId} order by `index`"})
    List<DisplaySlide> selectByDisplayId(@Param("displayId") Long displayId);

    @Delete({"delete from display_slide where display_id = #{displayId}"})
    int deleteByDisplayId(@Param("displayId") Long displayId);

    @Select({
            "select ",
            "	s.*,",
            "	d.id as 'display.id',",
            "	d.`name` as 'display.name',",
            "	d.description as 'display.description',",
            "	d.project_id as 'display.projectid',",
            "	d.avatar as 'display.avatar',",
            "	d.publish as 'display.publish',",
            "	d.config as 'display.config',",
            "	p.id 'project.id',",
            "	p.`name` 'project.name',",
            "	p.description 'project.description',",
            "	p.pic 'project.pic',",
            "	p.org_id 'project.orgid',",
            "	p.user_id 'project.userid',",
            "	p.visibility 'p.visibility'",
            "from display_slide s ",
            "   left join display d on d.id = s.display_id",
            "   left join project p on p.id = d.project_id",
            "where s.id = #{slideId}",
    })
    SlideWithDisplayAndProject getSlideWithDispalyAndProjectById(@Param("slideId") Long slideId);

    @Insert({
    	"<script>",
    	"	insert into display_slide" + 
    	"	<trim prefix='(' suffix=')' suffixOverrides=','>" + 
    	"		`display_id`," + 
    	"		`index`," + 
    	"		`config`," + 
    	"		`create_by`," + 
    	"		`create_time`" + 
    	"	</trim>" + 
    	"	select ${displayId}, `index`, `config`, ${useId}, NOW()" + 
    	"	from display_slide where display_id = #{originDisplayId}",
		"</script>"
    })
    int copySlide(@Param("originDisplayId") Long originDisplayId, @Param("displayId") Long displayId, @Param("userId") Long userId);

    @Select({
    	"<script>",
    	"	select `id`, `display_id`, `index` from display_slide" + 
    	"	<if test='displayIds != null and displayIds.size > 0'>" + 
    	" 		where `display_id` in" + 
    	"		<foreach collection='displayIds' index='index' item='item' open='(' close=')' separator=','>" + 
    	"			#{item}" + 
    	"		</foreach>" + 
    	"	</if>" + 
    	"	<if test='displayIds == null or displayIds.size == 0'>" + 
    	"		where 1=0" + 
    	"	</if>",
		"</script>"
    })
    List<DisplaySlide> queryByDisplayIds(@Param("displayIds") Set<Long> displayIds);
}