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

import edp.davinci.common.model.RelModelCopy;
import edp.davinci.core.model.RoleDisableViz;
import edp.davinci.model.RelRoleSlide;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface RelRoleSlideMapper {

    int insert(RelRoleSlide relRoleSlide);

    int insertBatch(List<RelRoleSlide> list);

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
    List<Long> getById(Long slideId);

    @Select({
            "select rrs.slide_id",
            "from rel_role_slide rrs",
            "inner join display_slide s on s.id = rrs.slide_id",
            "INNER JOIN display d on d.id = s.display_id",
            "where rrs.role_id = #{id} and rrs.visible = 0 and d.project_id = #{projectId}"
    })
    List<Long> getExecludeSlides(@Param("id") Long id, @Param("projectId") Long projectId);

    @Delete({"delete from rel_role_slide where slide_id = #{slideId} and role_id = #{roleId}"})
    int delete(@Param("slideId") Long slideId, @Param("roleId") Long roleId);

    @Delete({"delete from rel_role_slide where role_id = #{roleId}"})
    int deleteByRoleId(Long roleId);

    @Delete({"DELETE rrs FROM rel_role_slide rrs WHERE rrs.slide_id IN " +
            "( " +
            "SELECT ds.id " +
            "FROM display_slide ds " +
            "WHERE ds.display_id = #{displayId} " +
            ") "})
    int deleteByDisplayId(@Param("displayId") Long displayId);

    int copyRoleSlideRelation(@Param("relSlideCopies") List<RelModelCopy> slideCopies, @Param("userId") Long userId);

    @Delete({
            "delete from rel_role_slide where slide_id in ",
            "(select ds.id from display_slide ds ",
            "left join display d on d.id = ds.display_id ",
            "where d.project_id = #{projectId})"
    })
    int deleteByProject(Long projectId);
    
    @Delete({
        "delete from rel_role_slide where role_id = #{roleId} and slide_id in ",
        "(select ds.id from display_slide ds ",
        "left join display d on d.id = ds.display_id ",
        "where d.project_id = #{projectId})"
    })
    int deleteByRoleAndProject(Long roleId, Long projectId);
}