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


import edp.davinci.dto.teamDto.TeamFullId;
import edp.davinci.dto.userDto.UserWithTeamId;
import edp.davinci.model.RelUserTeam;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public interface RelUserTeamMapper {

    int insert(RelUserTeam relUserTeam);


    @Select({"select * from rel_user_team where user_id = #{userId} and team_id = #{teamId}"})
    RelUserTeam getRel(@Param("userId") Long userId, @Param("teamId") Long teamId);

    @Delete({"delete from rel_user_team where team_id = #{teamId}"})
    int deleteByTeamId(@Param("teamId") Long teamId);

    @Select({"select * from rel_user_team where id = #{id}"})
    RelUserTeam getById(@Param("id") Long id);

    @Delete({"delete from rel_user_team where id = #{id}"})
    int deleteById(@Param("id") Long id);


    @Select({"select * from rel_user_team where team_id = #{teamId}"})
    List<RelUserTeam> getRelByTeamId(@Param("teamId") Long teamId);


    @Select({
            "SELECT team_id FROM rel_user_team WHERE user_id = #{userId}"
    })
    Set<Long> getUserTeamId(@Param("userId") Long userId);


    @Select({
            "SELECT userTeamStruct(#{userId})"
    })
    String getUserFullTeam(@Param("userId") Long userId);


    @Select({
            "SELECT u.id, u.username, u.avatar, t.id as 'teamId' FROM `user` u, rel_user_team rut, team t ",
            "where rut.user_id = u.id and t.id = rut.team_id and FIND_IN_SET(#{teamId},t.full_team_id) > 0"
    })
    List<UserWithTeamId> getChildTeamMembers(@Param("teamId") Long teamId);


    @Update({
            "UPDATE rel_user_team",
            "SET `team_id` = #{teamId},",
            "`user_id` = #{userId},",
            "`role` = #{role}",
            "WHERE id = #{id}"
    })
    int update(RelUserTeam rel);


    /**
     * 查询用户和project所在team结构中的最大权限
     * project和用户所在team交集的 完整team结构
     *
     * @param projectId
     * @param userId
     * @return
     */
    @Select({"SELECT IFNULL(MAX(role),0) FROM rel_user_team where user_id = #{userId} and FIND_IN_SET(team_id,projectTeamStruct(#{projectId})) > 0"})
    short getUserAllTeamMaxRoleByProjectId(@Param("projectId") Long projectId, @Param("userId") Long userId);


    /**
     * 查询用户所在team结构中的最大权限
     *
     * @param teamId
     * @param userId
     * @return
     */
    @Select({
            "SELECT IFNULL(max(r.role),0) FROM team t inner JOIN rel_user_team r on r.team_id = t.id ",
            "where r.user_id = #{userId} and FIND_IN_SET(t.id,t.full_team_id) > 0"
    })
    short getUserAllTeamMaxRoleByChildTeamId(@Param("teamId") Long teamId, @Param("userId") Long userId);


    /**
     * 查询用户在project对应team中的最大权限
     *
     * @param projectId
     * @param userId
     * @return
     */
    @Select({
            "SELECT IFNULL(max(rut.role),0) FROM rel_team_project rtp INNER JOIN rel_user_team rut on rut.team_id = rtp.team_id",
            "where rtp.project_id = #{projectId} and rut.user_id = #{userId}"
    })
    short getUserMaxRoleWithProjectId(@Param("projectId") Long projectId, @Param("userId") Long userId);


    /**
     * 查询用户在organization下参与的team数
     *
     * @param orgId
     * @param userId
     * @return
     */
    @Select({
            "SELECT COUNT(distinct rut.id) FROM rel_user_team rut ",
            "LEFT JOIN team t on t.id = rut.team_id",
            "LEFT JOIN organization o on t.org_id = o.id",
            "WHERE org_id = #{orgId} and rut.user_id = #{userId}",
    })
    Integer getTeamNumOfOrgByUser(@Param("orgId") Long orgId, @Param("userId") Long userId);


    @Select({"SELECT id FROM rel_user_team WHERE user_id = #{userId} and team_id IN (SELECT id from team WHERE org_id = #{orgId})"})
    List<Long> getRelUserTeamIds(@Param("userId") Long userId, @Param("orgId") Long orgId);


    int deleteBatch(@Param("list") List<Long> list);


    int insertBatch(@Param("set") Set<RelUserTeam> set);

    /**
     * 查询用户和project所在team id 交集
     *
     * @param userId
     * @param projectId
     * @return
     */
    @Select({
            "SELECT DISTINCT t.id FROM team t",
            "LEFT JOIN rel_team_project rtp on rtp.team_id = t.id",
            "LEFT JOIN rel_user_team rut on rut.team_id = t.id",
            "WHERE rut.user_id = #{userId} and rtp.project_id = #{projectId}"
    })
    Set<Long> selectTeamIdByUserAndProject(@Param("userId") Long userId, @Param("projectId") Long projectId);


    /**
     * 查询用户和project所在team id 交集
     *
     * @param userId
     * @param projectId
     * @return
     */
    @Select({
            "SELECT DISTINCT t.id, t.full_team_id as fullTeamId FROM team t",
            "LEFT JOIN rel_team_project rtp on rtp.team_id = t.id",
            "LEFT JOIN rel_user_team rut on rut.team_id = t.id",
            "WHERE rut.user_id = #{userId} and rtp.project_id = #{projectId}"
    })
    List<TeamFullId> selectTeamFullParentByUserAndProject(@Param("userId") Long userId, @Param("projectId") Long projectId);
}