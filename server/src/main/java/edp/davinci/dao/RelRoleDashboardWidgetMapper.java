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

import edp.davinci.model.RelRoleDashboardWidget;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Set;

public interface RelRoleDashboardWidgetMapper {

    int insertBatch(List<RelRoleDashboardWidget> list);

    int deleteByMemDashboardWidgetIds(@Param("memDashboardWidgetIds") Set<Long> memDashboardWidgetIds);

    @Delete({"delete from rel_role_dashboard_widget where mem_dashboard_widget_id = #{memDashboardWidgetId}"})
    int deleteByMemDashboardWidgetId(@Param("memDashboardWidgetId") Long memDashboardWidgetId);

    @Delete({"delete from rel_role_dashboard_widget where role_id = #{roleId}"})
    int deleteByRoleId(@Param("roleId") Long roleId);

    @Select({
            "SELECT rrdw.mem_dashboard_widget_id " +
                    "FROM rel_role_dashboard_widget rrdw " +
                    "INNER JOIN rel_role_user rru ON rru.role_id = rrdw.role_id " +
                    "WHERE rru.user_id = #{userId} AND rrdw.visible = 0 "
    })
    List<Long> getDisableByUser(@Param("userId") Long userId);

}