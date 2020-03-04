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

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import edp.davinci.core.dao.MemDisplaySlideWidgetMapper;
import edp.davinci.core.dao.entity.MemDisplaySlideWidget;
import edp.davinci.server.dto.display.MemDisplaySlideWidgetWithSlide;

@Component
public interface MemDisplaySlideWidgetExtendMapper extends MemDisplaySlideWidgetMapper {

	@Delete({
		"<script>",
		"	delete from mem_display_slide_widget where" + 
		"	<if test='list != null and list.size > 0'>" + 
		"		`id` in" + 
		"	<foreach collection='list' index='index' item='item' open='(' close=')' separator=','>" + 
		"		#{item}" + 
		"	</foreach>" + 
		"	</if>" + 
		"	<if test='list == null or list.size == 0'>" + 
		"		1=0" + 
		"	</if>",
		"</script>"
	})
    int deleteBatchById(@Param("list") List<Long> list);

    @Delete({
            "delete from mem_display_slide_widget where display_slide_id in ",
            "(select s.id from display_slide s left join display d on s.display_id = d.id where d.project_id = #{projectId})"
    })
    int deleteByProject(@Param("projectId") Long projectId);

    @Update({
            "update mem_display_slide_widget",
            "set `display_slide_id` = #{displaySlideId,jdbcType=BIGINT},",
            "widget_id = #{widgetId,jdbcType=BIGINT},",
            "`name` = #{name,jdbcType=VARCHAR},",
            "`type` = #{type,jdbcType=SMALLINT},",
            "sub_type = #{subType,jdbcType=SMALLINT},",
            "`index` = #{index,jdbcType=INTEGER},",
            "`params` = #{params,jdbcType=LONGVARCHAR},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(MemDisplaySlideWidget memDisplaySlideWidget);

    @Select({"SELECT m.* FROM mem_display_slide_widget m WHERE m.display_slide_id = #{slideId}"})
    List<MemDisplaySlideWidget> getMemDisplaySlideWidgetListBySlideId(@Param("slideId") Long slideId);

    @Delete({"delete from mem_display_slide_widget where display_slide_id in (select id from display_slide where display_id = #{displayId})"})
    int deleteByDisplayId(@Param("displayId") Long displayId);

    @Delete({"delete from mem_display_slide_widget where display_slide_id = #{slideId}"})
    int deleteBySlideId(@Param("slideId") Long slideId);

    @Insert({
    	"<script>",
    	"	insert into mem_display_slide_widget" + 
    	"	(`id`,`display_slide_id`, `widget_id`, `name`, `type`, `params`,`sub_type`, `index`,`create_by`,`create_time`)" + 
    	"		values" + 
    	"	<foreach collection='list' item='record' index='index' separator=','>" + 
    	"		(" + 
    	"		<choose>" + 
    	"			<when test='record.id != null and record.id > 0'>" + 
    	"				#{record.id,jdbcType=BIGINT}," + 
    	"			</when>" + 
    	"			<otherwise>" + 
    	"				null," + 
    	"			</otherwise>" + 
    	"		</choose>" + 
    	"		#{record.displaySlideId,jdbcType=BIGINT}," + 
    	"		#{record.widgetId,jdbcType=BIGINT}," + 
    	"		#{record.name,jdbcType=VARCHAR}," + 
    	"		#{record.type,jdbcType=SMALLINT}," + 
    	"		#{record.params,jdbcType=LONGVARCHAR}," + 
    	"		#{record.subType,jdbcType=SMALLINT}," + 
    	"		#{record.index,jdbcType=INTEGER}," + 
    	"		#{record.createBy,jdbcType=BIGINT}," + 
    	"		#{record.createTime,jdbcType=TIMESTAMP}" + 
    	"		)" + 
    	"	</foreach>",
    	"</script>"
    })
    int insertBatch(@Param("list") List<MemDisplaySlideWidget> list);

    @Update({
    	"<script>",
    	"	<foreach collection='list' item='record' index='index' open='' close='' separator=';'>" + 
    	"		update mem_display_slide_widget" + 
    	"	<set>" + 
    	"		`display_slide_id` = #{record.displaySlideId,jdbcType=BIGINT}," + 
    	"		`widget_id` = #{record.widgetId,jdbcType=BIGINT}," + 
    	"		`name` = #{record.name,jdbcType=VARCHAR}," + 
    	"		`type` = #{record.type,jdbcType=SMALLINT}," + 
    	"		`sub_type` = #{record.subType,jdbcType=SMALLINT}," + 
    	"		`index` = #{record.index,jdbcType=INTEGER}," + 
    	"		`params` = #{record.params,jdbcType=LONGVARCHAR}," + 
    	"		`update_by` = #{record.updateBy,jdbcType=BIGINT}," + 
    	"		`update_time` = #{record.updateTime,jdbcType=TIMESTAMP}" + 
    	"	</set>" + 
    	"		where `id` = #{record.id,jdbcType=BIGINT}" + 
    	"	</foreach>",
    	"</script>"
    })
    int updateBatch(@Param("list") List<MemDisplaySlideWidget> list);

    @Select({
            "select m.*,",
            "	s.id 'displayslide.id',",
            "	s.display_id 'displayslide.displayid',",
            "	s.`index` 'displayslide.index',",
            "	s.`config` 'displayslide.config'",
            "from mem_display_slide_widget m left join display_slide s on m.display_slide_id = s.id",
            "where s.display_id = #{displayId}",
    })
    List<MemDisplaySlideWidgetWithSlide> getMemWithSlideByDisplayId(@Param("displayId") Long displayId);

    @Delete({"delete from mem_display_slide_widget where widget_id = #{widgetId}"})
    int deleteByWidget(@Param("widgetId") Long widgetId);
}