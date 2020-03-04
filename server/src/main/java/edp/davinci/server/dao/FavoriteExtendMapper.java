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

package edp.davinci.server.dao;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Component;

import edp.davinci.core.dao.FavoriteMapper;
import edp.davinci.core.dao.entity.Favorite;

import java.util.List;

@Component
public interface FavoriteExtendMapper extends FavoriteMapper {

    @Insert({
        "insert ignore into favorite (id, user_id, ",
        "project_id, create_time)",
        "values (#{id,jdbcType=BIGINT}, #{userId,jdbcType=BIGINT}, ",
        "#{projectId,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP})"
    })
    int insert(Favorite favorite);

    @Delete({
    	"<script>",
    	"	delete from favorite where `user_id` = #{userId}" + 
    	"		<if test='list != null and list.size > 0'>" + 
    	"			and `project_id` in" + 
    	"		<foreach collection='list' index='index' item='item' open='(' close=')' separator=','>" + 
    	"			#{item}" + 
    	"		</foreach>" + 
    	"		</if>" + 
    	"		<if test='list == null or list.size == 0'>" + 
    	"			and 1=0" + 
    	"		</if>",
    	"</script>"
    })
    int deleteBatch(@Param("list") List<Long> list, @Param("userId") Long userId);
}