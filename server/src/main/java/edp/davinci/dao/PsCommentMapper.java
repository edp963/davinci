/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2018 EDP
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

import edp.davinci.model.Team;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface PsCommentMapper {


    @Select({"SELECT  t.* from team t LEFT JOIN ps_rel_dept_team p on p.target_id = t.id WHERE p.type = 2 and p.full_desc = #{fullDesc}"})
    List<Team> getByDesc(@Param("fullDesc") String fullDesc);

    @Select({
            "SELECT  t.* from team t",
            "LEFT JOIN ps_rel_dept_team p on p.target_id = t.id",
            "LEFT JOIN rel_user_team r on r.team_id = t.id",
            "WHERE p.type = 2 and r.user_id = #{userId}"
    })
    List<Team> getPsTeamByUserId(@Param("userId") Long userId);
}