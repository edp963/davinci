/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.dao;

import edp.davinci.model.Project;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface ProjectMapper {

    /**
     * 获取项目列表
     * 用户创建 + 用户所在组里可访问的项目
     *
     * @return
     */
    @Select({
            "SELECT * FROM project",
            "   WHERE id IN (",
            //用户创建
            "   SELECT id  FROM project WHERE user_id = #{userId}",
            "   UNION",
            //用户所在组里可以访问
            "   SELECT p.id",
            "   FROM project p",
            "       LEFT JOIN rel_team_project rtp on rtp.project_id = p.id",
            "       LEFT JOIN team t ON t.id = rtp.team_id",
            "       LEFT JOIN rel_user_team rut ON rut.team_id = t.id",
            "   WHERE rut.user_id = #{userId} AND p.visibility = 1",
            ") order by id asc"
    })
    List<Project> getProejctsByUser(Long userId);


    @Select({"select id from project where org_id = #{orgId} and `name` = #{name}"})
    Long getByNameWithOrgId(@Param("name") String name, @Param("orgId") Long orgId);


    int insert(Project project);

    @Select({"select * from project where id = #{id}"})
    Project getById(@Param("id") Long id);


    @Select({"select * from project where id = #{id} and user_id = #{userId}"})
    Project getByProject(Project project);

    @Update({"update project set `name` = #{name}, description = #{description}, visibility = #{visibility}  where id = #{id}"})
    int updateBaseInfo(Project project);

    @Update({"update project set `org_id` = #{orgId} where id = #{id}"})
    int changeOrganization(Project project);

    @Delete({"delete from project where id = #{id}"})
    int deleteById(@Param("id") Long id);

    @Select({"select * from project where org_id = #{orgId}"})
    List<Project> getByOrgId(@Param("orgId") Long orgId);

    @Select({"SELECT p.* FROM project p INNER JOIN display d on p.id = d.project_id where d.id = #{displayId}"})
    Project getByDisplayId(@Param("displayId") Long displayId);
}