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
 */

package edp.davinci.dao;

import edp.davinci.common.model.RelModelCopy;
import edp.davinci.model.RelRoleDisplaySlideWidget;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Set;

public interface RelRoleDisplaySlideWidgetMapper {

    int insertBatch(List<RelRoleDisplaySlideWidget> list);

    int deleteByMemDisplaySlideWidgetIds(@Param("memDisplaySlideWidgetIds") Set<Long> memDisplaySlideWidgetIds);

    @Delete({"delete from rel_role_display_slide_widget where mem_display_slide_widget_id = #{memDisplaySlideWidgetId}"})
    int deleteByMemDisplaySlideWidgetId(@Param("memDisplaySlideWidgetId") Long memDisplaySlideWidgetId);

    @Delete({"delete from rel_role_display_slide_widget where role_id = #{roleId}"})
    int deleteByRoleId(@Param("roleId") Long roleId);

    @Delete({"DELETE rrdsw FROM rel_role_display_slide_widget rrdsw WHERE rrdsw.mem_display_slide_widget_id IN " +
            "( " +
            "SELECT mdsw.id " +
            "FROM mem_display_slide_widget mdsw " +
            "INNER JOIN display_slide ds ON ds.id = mdsw.display_slide_id " +
            "WHERE ds.display_id = #{displayId} " +
            ") "})
    int deleteByDisplayId(@Param("displayId") Long displayId);

    @Delete({"DELETE rrdsw FROM rel_role_display_slide_widget rrdsw WHERE rrdsw.mem_display_slide_widget_id IN " +
            "( " +
            "SELECT mdsw.id " +
            "FROM mem_display_slide_widget mdsw " +
            "WHERE mdsw.display_slide_id = #{slideId} " +
            ") "})
    int deleteBySlideId(@Param("slideId") Long slideId);

    @Select({
            "SELECT rrdsw.mem_display_slide_widget_id " +
                    "FROM rel_role_display_slide_widget rrdsw " +
                    "INNER JOIN rel_role_user rru ON rru.role_id = rrdsw.role_id " +
                    "WHERE rru.user_id = #{userId} AND rrdsw.visible = 0 "
    })
    List<Long> getDisableByUser(@Param("userId") Long userId);

    @Delete({"DELETE rrdsw FROM rel_role_display_slide_widget rrdsw WHERE rrdsw.mem_display_slide_widget_id IN " +
            "( " +
            "SELECT mdsw.id " +
            "FROM mem_display_slide_widget mdsw " +
            "INNER JOIN display_slide ds ON ds.id = mdsw.display_slide_id " +
            "INNER JOIN display d ON d.id = ds.display_id " +
            "WHERE d.project_id = #{projectId} " +
            ") "})
    int deleteByProjectId(@Param("projectId") Long projectId);


    int copyRoleSlideWidgetRelation(@Param("relSlideCopies") List<RelModelCopy> memCopies, @Param("userId") Long userId);
}