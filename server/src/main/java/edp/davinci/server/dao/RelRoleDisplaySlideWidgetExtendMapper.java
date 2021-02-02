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
 */

package edp.davinci.server.dao;

import edp.davinci.core.dao.RelRoleDisplaySlideWidgetMapper;
import edp.davinci.core.dao.entity.RelRoleDisplaySlideWidget;
import edp.davinci.server.dto.rel.RelModelCopy;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface RelRoleDisplaySlideWidgetExtendMapper extends RelRoleDisplaySlideWidgetMapper {

	@Insert({
		"<script>",
		"		replace into rel_role_display_slide_widget" + 
		"		(`role_id`, `mem_display_slide_widget_id`, `visible`, `create_by`, `create_time`)" + 
		"		values" + 
		"		<foreach collection='list' item='record' index='index' separator=','>" + 
		"		(" + 
		"			#{record.roleId,jdbcType=BIGINT}," + 
		"			#{record.memDisplaySlideWidgetId,jdbcType=BIGINT}," + 
		"			#{record.visible,jdbcType=TINYINT}," + 
		"			#{record.createBy,jdbcType=BIGINT}," + 
		"			#{record.createTime,jdbcType=TIMESTAMP}" + 
		"		)" + 
		"		</foreach>",
		"</script>"
	})
    int insertBatch(List<RelRoleDisplaySlideWidget> list);

    @Delete({
    	"<script>",
    	"		delete from rel_role_display_slide_widget where" + 
    	"		<if test='memDisplaySlideWidgetIds != null and memDisplaySlideWidgetIds.size > 0'>" + 
    	"			mem_display_slide_widget_id in" + 
    	"			<foreach collection='memDisplaySlideWidgetIds' index='index' item='item' open='(' close=')' separator=','>" + 
    	"				#{item}" + 
    	"			</foreach>" + 
    	"		</if>" + 
    	"		<if test='memDisplaySlideWidgetIds == null or memDisplaySlideWidgetIds.size == 0'>" + 
    	"			1=0" + 
    	"		</if>",
    	"</script>"
    })
    int deleteByMemDisplaySlideWidgetIds(@Param("memDisplaySlideWidgetIds") Set<Long> memDisplaySlideWidgetIds);

    @Delete({"delete from rel_role_display_slide_widget where mem_display_slide_widget_id = #{memDisplaySlideWidgetId}"})
    int deleteByMemDisplaySlideWidgetId(@Param("memDisplaySlideWidgetId") Long memDisplaySlideWidgetId);

    @Delete({"delete from rel_role_display_slide_widget where role_id = #{roleId}"})
    int deleteByRoleId(@Param("roleId") Long roleId);

    @Delete({"delete rrdsw from rel_role_display_slide_widget rrdsw where rrdsw.mem_display_slide_widget_id in " +
            "( " +
            "select mdsw.id " +
            "from mem_display_slide_widget mdsw " +
            "inner join display_slide ds on ds.id = mdsw.display_slide_id " +
            "where ds.display_id = #{displayId} " +
            ") "})
    int deleteByDisplayId(@Param("displayId") Long displayId);

    @Delete({"delete rrdsw from rel_role_display_slide_widget rrdsw where rrdsw.mem_display_slide_widget_id in " +
            "( " +
            "select mdsw.id " +
            "from mem_display_slide_widget mdsw " +
            "where mdsw.display_slide_id = #{slideId} " +
            ") "})
    int deleteBySlideId(@Param("slideId") Long slideId);

    @Select({
            "select rrdsw.mem_display_slide_widget_id " +
                    "from rel_role_display_slide_widget rrdsw " +
                    "inner join rel_role_user rru on rru.role_id = rrdsw.role_id " +
                    "where rru.user_id = #{userId} and rrdsw.visible = 0 "
    })
    List<Long> getDisableByUser(@Param("userId") Long userId);

    @Delete({"delete rrdsw from rel_role_display_slide_widget rrdsw where rrdsw.mem_display_slide_widget_id in " +
            "( " +
            "select mdsw.id " +
            "from mem_display_slide_widget mdsw " +
            "inner join display_slide ds on ds.id = mdsw.display_slide_id " +
            "inner join display d on d.id = ds.display_id " +
            "where d.project_id = #{projectId} " +
            ") "})
    int deleteByProject(@Param("projectId") Long projectId);

    @Delete({"delete rrdsw from rel_role_display_slide_widget rrdsw where rrdsw.role_id = #{roleId} and rrdsw.mem_display_slide_widget_id in " +
        "( " +
        "select mdsw.id " +
        "from mem_display_slide_widget mdsw " +
        "inner join display_slide ds on ds.id = mdsw.display_slide_id " +
        "inner join display d on d.id = ds.display_id " +
        "where d.project_id = #{projectId} " +
        ") "})
    int deleteByRoleAndProject(Long roleId, Long projectId);

    @Insert({
    	"<script>",
    	"		<foreach collection='relSlideCopies' item='copy' open='' close='' separator=';'>" + 
    	"			replace into rel_role_display_slide_widget" + 
    	"			(`role_id`, `mem_display_slide_widget_id`, `visible`, `create_by`, `create_time`)" + 
    	"			select `role_id`, ${copy.copyId}, `visible`, ${userId}, NOW() from rel_role_display_slide_widget" + 
    	"			where mem_display_slide_widget_id = #{copy.originId}" + 
    	"		</foreach>",
    	"</script>"
    })
    int copyRoleSlideWidgetRelation(@Param("relSlideCopies") List<RelModelCopy> memCopies, @Param("userId") Long userId);
}