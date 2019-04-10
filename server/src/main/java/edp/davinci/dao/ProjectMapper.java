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

import edp.davinci.dto.organizationDto.OrganizationInfo;
import edp.davinci.dto.projectDto.ProjectWithCreateBy;
import edp.davinci.dto.projectDto.ProjectWithOrganization;
import edp.davinci.model.Project;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface ProjectMapper {


    List<ProjectWithCreateBy> getProejctsByUser(@Param("userId") Long userId);

    List<ProjectWithCreateBy> getFavoriteProjects(@Param("userId") Long userId);

    List<ProjectWithCreateBy> getProjectsByOrgWithUser(@Param("orgId") Long orgId, @Param("userId") Long userId, @Param("keyword") String keyword);


    @Select({"select id from project where org_id = #{orgId} and `name` = #{name}"})
    Long getByNameWithOrgId(@Param("name") String name, @Param("orgId") Long orgId);


    int insert(Project project);

    @Select({
            "SELECT ",
            "    p.*, ",
            "    u.id as 'createBy.id',",
            "    IF(u.`name` is NULL,u.username,u.`name`) as 'createBy.username',",
            "    u.avatar as 'createBy.avatar'",
            "from project p",
            "LEFT JOIN `user` u on u.id = p.user_id",
            "where p.id = #{id}",
    })
    ProjectWithCreateBy getProjectWithUserById(@Param("id") Long id);


    @Select({"select * from project where id = #{id}"})
    Project getById(@Param("id") Long id);


    @Select({
            "SELECT p.*, ",
            "    o.`id` AS 'organization.id',",
            "    o.`name` AS 'organization.name',",
            "    o.`description` AS 'organization.description',",
            "    o.`avatar` AS 'organization.avatar',",
            "    o.`user_id` AS 'organization.userId',",
            "    o.`project_num` AS 'organization.projectNum',",
            "    o.`member_num` AS 'organization.memberNum',",
            "    o.`team_num` AS 'organization.teamNum',",
            "    o.`allow_create_project` AS 'organization.allowCreateProject',",
            "    o.`member_permission` AS 'organization.memberPermission',",
            "    o.`create_time` AS 'organization.createTime',",
            "    o.`create_by` AS 'organization.createBy',",
            "    o.`update_time` AS 'organization.updateTime',",
            "    o.`update_by` AS 'organization.updateBy'",
            "FROM project p LEFT JOIN organization o on o.id = p.org_id WHERE p.id = #{id}"
    })
    ProjectWithOrganization getProjectWithOrganization(@Param("id") Long id);


    @Select({"select * from project where id = #{id} and user_id = #{userId}"})
    Project getByProject(Project project);

    @Update({"update project set `name` = #{name}, description = #{description}, visibility = #{visibility}  where id = #{id}"})
    int updateBaseInfo(Project project);

    @Update({"update project set `org_id` = #{orgId} where id = #{id}"})
    int changeOrganization(Project project);


    @Update({"update project set `is_transfer` = #{isTransfer, jdbcType=TINYINT} where id = #{id}"})
    int changeTransferStatus(@Param("isTransfer") Boolean isTransfer, @Param("id") Long id);

    @Delete({"delete from project where id = #{id}"})
    int deleteById(@Param("id") Long id);

    @Select({"select * from project where org_id = #{orgId}"})
    List<Project> getByOrgId(@Param("orgId") Long orgId);

    @Select({"SELECT p.* FROM project p INNER JOIN display d on p.id = d.project_id where d.id = #{displayId}"})
    Project getByDisplayId(@Param("displayId") Long displayId);

    List<ProjectWithCreateBy> getProjectsByKewordsWithUser(@Param("keywords") String keywords, @Param("userId") Long userId, @Param("list") List<OrganizationInfo> list);

    @Update({"update project set star_num = star_num + 1 where id = #{id}"})
    int starNumAdd(@Param("id") Long id);


    @Update({"update project set star_num = IF(star_num > 0,star_num - 1, 0) where id = #{id}"})
    int starNumReduce(@Param("id") Long id);

}