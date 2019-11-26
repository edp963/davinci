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

import edp.davinci.model.RelRoleView;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

public interface RelRoleViewMapper {

    int insert(RelRoleView relRoleView);

    int insertBatch(@Param("list") List<RelRoleView> list);

    @Delete({
            "delete from rel_role_view where role_id = #{roleId} and view_id = #{viewId}"
    })
    int delete(@Param("roleId") Long roleId, @Param("viewId") Long viewId);

    @Update({
            "update rel_role_view",
            "set `row_auth` = #{rowAuth, jdbcType=LONGVARCHAR},",
            "`column_auth` = #{columnAuth, jdbcType=LONGVARCHAR},",
            "update_by = #{updateBy, jdbcType=BIGINT},",
            "update_time = #{updateTime, jdbcType=TIMESTAMP}",
            "where role_id = #{roleId} and view_id = #{viewId}"
    })
    int update(RelRoleView relRoleView);

    @Delete({
            "delete from rel_role_view where  view_id = #{viewId}"
    })
    int deleteByViewId(Long viewId);


    @Delete({
            "delete from rel_role_view where  role_id = #{roleId}"
    })
    int deleteByRoleId(Long roleId);

    @Select({
            "select rrv.* from rel_role_view rrv",
            "       left join `view` v on v.id = rrv.view_id",
            "       left join rel_role_user rru on rru.role_id = rrv.role_id",
            "where v.id = #{viewId} and rru.user_id = #{userId}"
    })
    List<RelRoleView> getByUserAndView(@Param("userId") Long userId, @Param("viewId") Long viewId);

    @Select({
           "select * from rel_role_view where  view_id = #{viewId}"
    })
    List<RelRoleView> getByView(Long viewId);

    @Delete({
            "delete from rel_role_view where view_id in (select id from view where project_id = #{projectId})"
    })
    int deleteByProject(Long projectId);
}