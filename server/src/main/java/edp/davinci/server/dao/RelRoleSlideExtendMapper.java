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

import edp.davinci.core.dao.RelRoleSlideMapper;
import edp.davinci.core.dao.entity.RelRoleSlide;
import edp.davinci.server.dto.rel.RelModelCopy;
import edp.davinci.server.model.RoleDisableViz;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface RelRoleSlideExtendMapper extends RelRoleSlideMapper {

	@Insert({
		"<script>",
		"		insert ignore rel_role_slide" + 
		"			<trim prefix='(' suffix=')' suffixOverrides=','>" + 
		"			`role_id`," + 
		"			`slide_id`," + 
		"			`visible`," + 
		"			`create_by`," + 
		"			`create_time`" + 
		"			</trim>" + 
		"			<trim prefix='values (' suffix=')' suffixOverrides=','>" + 
		"			#{roleId,jdbcType=BIGINT}," + 
		"			#{slideId,jdbcType=BIGINT}," + 
		"			#{visible,jdbcType=TINYINT}," + 
		"			#{createBy,jdbcType=BIGINT}," + 
		"			#{createTime,jdbcType=TIMESTAMP}" + 
		"			</trim>",
		"</script>"
	})
    int insert(RelRoleSlide relRoleSlide);

	@Insert({
		"<script>",
		"	replace into rel_role_slide" + 
		"		(`role_id`, `slide_id`, `visible`, `create_by`, `create_time`)" + 
		"		VALUES" + 
		"		<foreach collection='list' item='record' index='index' separator=','>" + 
		"			(" + 
		"			#{record.roleId,jdbcType=BIGINT}," + 
		"			#{record.slideId,jdbcType=BIGINT}," + 
		"			#{record.visible,jdbcType=TINYINT}," + 
		"			#{record.createBy,jdbcType=BIGINT}," + 
		"			#{record.createTime,jdbcType=TIMESTAMP}" + 
		"			)" + 
		"		</foreach>",
		"</script>"
	})
    int insertBatch(List<RelRoleSlide> list);
	
	@Insert({
		"<script>",
		"	<foreach collection='relSlideCopies' item='copy' open='' close='' separator=';'>" + 
		"		replace into rel_role_slide (`role_id`,`slide_id`,`visible`,`create_by`,`create_time`)" + 
		"		select `role_id`, ${copy.copyId}, visible, ${userId}, NOW() from rel_role_slide" + 
		"		where slide_id = #{copy.originId}" + 
		"	</foreach>",
		"</script>"
	})
	int copyRoleSlideRelation(@Param("relSlideCopies") List<RelModelCopy> slideCopies, @Param("userId") Long userId);

    @Delete("delete from rel_role_slide where slide_id = #{slideId}")
    int deleteBySlideId(Long slideId);

    @Select({
            "select rru.role_id as roleId, rrs.slide_id as vizId",
            "from rel_role_slide rrs",
            "inner join rel_role_user rru on rru.role_id = rrs.role_id",
            "inner join display_slide s on s.id = rrs.slide_id",
            "where rru.user_id = #{userId} and rrs.visible = 0 and s.display_id = #{displayId}"
    })
    List<RoleDisableViz> getDisableSlides(@Param("userId") Long userId, @Param("displayId") Long displayId);

    @Select({
            "select role_id from rel_role_slide where slide_id = #{slideId} and visible = 0"
    })
    List<Long> getBySlideId(Long slideId);

    @Select({
            "select rrs.slide_id",
            "from rel_role_slide rrs",
            "inner join display_slide s on s.id = rrs.slide_id",
            "INNER JOIN display d on d.id = s.display_id",
            "where rrs.role_id = #{roleId} and rrs.visible = 0 and d.project_id = #{projectId}"
    })
    List<Long> getExcludeSlides(@Param("roleId") Long roleId, @Param("projectId") Long projectId);

    @Delete({"delete from rel_role_slide where role_id = #{roleId}"})
    int deleteByRoleId(Long roleId);

    @Delete({"delete rrs from rel_role_slide rrs where rrs.slide_id in " +
            "( " +
            "select ds.id " +
            "from display_slide ds " +
            "where ds.display_id = #{displayId} " +
            ") "})
    int deleteByDisplayId(@Param("displayId") Long displayId);

    @Delete({
            "delete from rel_role_slide where slide_id in ",
            "(select ds.id from display_slide ds ",
            "left join display d on d.id = ds.display_id ",
            "where d.project_id = #{projectId})"
    })
    int deleteByProjectId(Long projectId);
}