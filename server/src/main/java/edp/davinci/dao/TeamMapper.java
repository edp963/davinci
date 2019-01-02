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

import edp.davinci.dto.teamDto.*;
import edp.davinci.model.Team;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface TeamMapper {

    @Select({"select * from team where org_id= #{orgId}"})
    List<Team> getByOrgId(@Param("orgId") Long orgId);

//    @Select({
//            "select t.id, t.`name`, t.description, t.visibility, t.parent_team_id from team t, rel_user_team rut",
//            "where rut.team_id = t.id and t.org_id = #{orgId} and rut.user_id = #{userId} and (rut.role = 1 OR t.visibility = 1)"
//    })
//    List<TeamBaseInfoWithParent> getTeamsByOrgId(@Param("orgId") Long orgId, @Param("userId") Long userId);


    @Select({
            "select distinct t.id, t.`name`, t.description, t.visibility, t.parent_team_id, t.full_team_id from team t left join rel_user_team rut on rut.team_id = t.id",
            "where t.org_id = #{orgId}"
    })
    List<TeamBaseInfoWithParent> getTeamsByOrgId(@Param("orgId") Long orgId);

    @Select({"select id from team where name = #{name} and org_id = #{orgId} "})
    Long getByNameWithOrgId(@Param("name") String name, @Param("orgId") Long orgId);

    int insert(Team team);

    @Update({
            "UPDATE team SET full_team_id = parentTeamIds(id) where id = #{id}"
    })
    int updateFullTeamById(@Param("id") Long id);

    @Select({"select * from team where id = #{id}"})
    Team getById(@Param("id") Long id);

    @Update({
            "update team",
            "set `name` = #{name},",
            "description = #{description},",
            "org_id = #{orgId},",
            "parent_team_id = #{parentTeamId},",
            "avatar = #{avatar},",
            "visibility = #{visibility}",
            "where id = #{id}"
    })
    int update(Team team);

    @Update({"update team set avatar = #{avatar} where id = #{id}"})
    int updateAvatar(Team team);


    @Delete({"delete from team where id = #{id}"})
    int deleteById(@Param("id") Long id);

    @Select({
            "SELECT rut.id, u.id as 'user.id', IF(u.`name` is NULL,u.username,u.`name`) as 'user.username', u.avatar as 'user.avatar', rut.role as 'user.role'",
            "FROM `user` u, rel_user_team rut WHERE u.id = rut.user_id AND rut.team_id = #{id}"})
    List<TeamMember> getTeamMembers(@Param("id") Long id);

    @Select({
            "select DISTINCT t.id, t.`name`, t.description, t.visibility, t.parent_team_id, t.full_team_id",
            "from team t left join rel_user_team rut on rut.team_id = t.id ",
            "where FIND_IN_SET(#{id}, t.full_team_id) > 0",
    })
    List<TeamBaseInfoWithParent> getChildTeams(@Param("id") Long id);


    @Select({
            "select ",
            "	distinct t.id, t.`name`, t.description, t.visibility, rut.role, t.avatar,",
            "	o.`id`  'organization.id',",
            "	o.`name`  'organization.name',",
            "	o.`description`  'organization.description',",
            "	o.`avatar`  'organization.avatar',",
            "	IFNULL(ruo.role,0) 'organization.role'",
            "from (team t,rel_user_team rut)",
            "LEFT JOIN organization o on o.id = t.org_id",
            "LEFT JOIN rel_user_organization ruo on (ruo.org_id = o.id and ruo.user_id = #{userId})",
            "where rut.team_id = t.id and rut.user_id = #{userId}",
    })
    List<MyTeam> getMyTeams(@Param("userId") Long userId);


    @Select({
            "SELECT id,`name`,parent_team_id as parentId",
            "FROM (",
            "	SELECT  @r AS _id, (SELECT @r := parent_team_id FROM team WHERE id = _id) AS parent_id",
            "	FROM  (SELECT @r := #{teamId}) v, team t WHERE @r <> 0",
            ")t1 JOIN team t2 ON t1._id = t2.id ORDER BY -t2.parent_team_id DESC"
    })
    List<TeamInfoWithParentId> getAllParentByTeamId(@Param("teamId") Long teamId);

    @Select({
            "select ",
            "	t.*,",
            "	o.`id`  'organization.id',",
            "	o.`name`  'organization.name',",
            "	o.`description`  'organization.description',",
            "	o.`avatar`  'organization.avatar'",
            "	o.`user_id`  'organization.userId',",
            "	o.`project_num`  'organization.projectNum',",
            "	o.`member_num`  'organization.memberNum',",
            "	o.`team_num`  'organization.teamNum',",
            "	o.`allow_create_project`  'organization.allowCreateProject',",
//            "	o.`allow_delete_or_transfer_project`  'organization.allowDeleteOrTransferProject',",
//            "	o.`allow_change_visibility`  'organization.allowChangeVisibility',",
            "	o.`member_permission`  'organization.memberPermission',",
            "	o.`create_time`  'organization.createTime',",
            "	o.`create_by`  'organization.createBy',",
            "	o.`update_time`  'organization.updateTime',",
            "	o.`update_by`  'organization.updateBy' ",
            "from team t ",
            "LEFT JOIN organization o on o.id = t.org_id",
            "where t.id = #{id}"
    })
    TeamWithOrg getTeamWithOrg(@Param("id") Long id);

    @Select({
            "SELECT t.id from rel_user_team r LEFT JOIN team t on t.id = r.team_id WHERE r.user_id = #{userId} and t.org_id = #{orgId}"
    })
    Set<Long> getUserTeams(@Param("userId") Long userId, @Param("orgId") Long orgId);


    Set<TeamFullId> getTeamsByIds(@Param("set") Set<Long> ids);
}