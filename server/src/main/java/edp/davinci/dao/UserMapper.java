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

import edp.davinci.dto.teamDto.TeamUserBaseInfo;
import edp.davinci.dto.userDto.UserBaseInfo;
import edp.davinci.model.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface UserMapper {

    int insert(User user);


    @Select({"select * from `user` where id = #{id}"})
    User getById(@Param("id") Long id);

    @Select({"select * from `user` where username = #{username}"})
    User selectByUsername(@Param("username") String username);


    List<UserBaseInfo> getUsersByKeyword(@Param("keyword") String keyword, @Param("orgId") Long orgId);


    @Update({"update `user` set `name` = #{name}, description = #{description}, department = #{department}, update_time = #{updateTime}",
            "where id = #{id}"})
    int updateBaseInfo(User user);

    @Update({"update user set avatar = #{avatar}, update_time = #{updateTime}  where id = #{id}"})
    int updateAvatar(User user);

    @Select({"select id from user where (LOWER(username) = LOWER(#{name}) or LOWER(email) = LOWER(#{name}) or LOWER(`name`) = LOWER(#{name}))"})
    Long getIdByName(@Param("name") String name);

    @Update({"update `user` set active = #{active}, update_time = #{updateTime}  where id = #{id}"})
    int activeUser(User user);

    @Update({"update `user` set password = #{password}, update_time = #{updateTime}  where id = #{id}"})
    int changePassword(User user);

    @Select({
            "SELECT u.id, u.username, u.avatar, t.id as 'teamId' FROM `user` u, rel_user_team rut, team t",
            "WHERE u.id = rut.user_id AND rut.team_id = t.id AND t.org_id = #{orgId}"
    })
    List<TeamUserBaseInfo> getUsersByTeamOrgId(Long orgId);
}