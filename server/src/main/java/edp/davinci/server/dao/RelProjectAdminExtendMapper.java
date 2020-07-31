/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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

package edp.davinci.server.dao;

import edp.davinci.core.dao.RelProjectAdminMapper;
import edp.davinci.core.dao.entity.RelProjectAdmin;
import edp.davinci.server.dto.project.RelProjectAdminDTO;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface RelProjectAdminExtendMapper extends RelProjectAdminMapper {

    @Insert({
        "insert ignore into rel_project_admin (id, project_id, ",
        "user_id, create_by, ",
        "create_time, update_by, ",
        "update_time)",
        "values (#{id,jdbcType=BIGINT}, #{projectId,jdbcType=BIGINT}, ",
        "#{userId,jdbcType=BIGINT}, #{createBy,jdbcType=BIGINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{updateBy,jdbcType=BIGINT}, ",
        "#{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(RelProjectAdmin relProjectAdmin);

    @Select({
            "select * from rel_project_admin where project_id = #{projectId} and user_id = #{userId}"
    })
    RelProjectAdmin getByProjectAndUser(@Param("projectId") Long projectId, @Param("userId") Long userId);

    @Delete({
            "delete from rel_project_admin where project_id = #{projectId} and user_id = #{userId}"
    })
    int delete(@Param("projectId") Long projectId, @Param("userId") Long userId);

    @Delete({
            "delete from rel_project_admin where project_id = #{projectId}"
    })
    int deleteByProject(Long projectId);

    @Select({
            "select r.id,",
            "    u.id                         as 'user.id',",
            "    ifnull(u.`name`, u.username) as 'user.username',",
            "    u.avatar                     as 'user.avatar'",
            "from rel_project_admin r",
            "    left join `user` u on u.id = r.user_id",
            "where r.project_id = #{projectId}"
    })
    List<RelProjectAdminDTO> getByProject(Long projectId);

    @Select({
            "select r.user_id",
            "from rel_project_admin r",
            "    left join `user` u on u.id = r.user_id",
            "where r.project_id = #{projectId}"
    })
    List<Long> getAdminIds(Long projectId);

    @Insert({
    	"<script>",
    	"	insert ignore into rel_project_admin" + 
    	"		(`project_id`, `user_id`, `create_by`, `create_time`)" + 
    	"		values" + 
    	"		<foreach collection='list' item='record' index='index' separator=','>" + 
    	"		(" + 
    	"		#{record.projectId,jdbcType=BIGINT}," + 
    	"		#{record.userId,jdbcType=BIGINT}," + 
    	"		#{record.createBy,jdbcType=BIGINT}," + 
    	"		#{record.createTime,jdbcType=TIMESTAMP}" + 
    	"		)" + 
    	"		</foreach>",
    	"</script>"
    })
    int insertBatch(List<RelProjectAdmin> list);
}