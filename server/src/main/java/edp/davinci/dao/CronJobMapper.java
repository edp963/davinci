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

import edp.davinci.model.CronJob;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface CronJobMapper {

    int insert(CronJob cronJob);

    @Delete({"delete from cron_job where id = #{id,jdbcType=BIGINT}"})
    int deleteById(@Param("id") Long id);


    @Select({"select * from cron_job where id = #{id}"})
    CronJob getById(@Param("id") Long id);


    @Select({"select * from cron_job where  job_status in ('stopped','failed') and update_time > (NOW() - INTERVAL 3 MINUTE)"})
    List<CronJob> getStopedJob();

    @Update({
            "update cron_job",
            "set `name` = #{name,jdbcType=VARCHAR},",
            "`project_id` = #{projectId,jdbcType=BIGINT},",
            "`job_type` = #{jobType,jdbcType=VARCHAR},",
            "`job_status` = #{jobStatus,jdbcType=VARCHAR},",
            "`cron_expression` = #{cronExpression,jdbcType=VARCHAR},",
            "`start_date` = #{startDate,jdbcType=TIMESTAMP},",
            "`end_date` = #{endDate,jdbcType=TIMESTAMP},",
            "`description` = #{description,jdbcType=VARCHAR},",
            "`config` = #{config,jdbcType=LONGVARCHAR},",
            "`exec_log` = #{execLog,jdbcType=LONGVARCHAR},",
            "`update_by` = #{updateBy,jdbcType=BIGINT},",
            "`update_time` = #{updateTime,jdbcType=TIMESTAMP}",
            "where `id` = #{id,jdbcType=BIGINT}"
    })
    int update(CronJob record);

    @Update({
            "update cron_job",
            "set `exec_log` = #{execLog,jdbcType=LONGVARCHAR}",
            "where `id` = #{id,jdbcType=BIGINT}"
    })
    int updateExecLog(@Param("id") Long id, @Param("execLog") String execLog);


    @Select({"select id from cron_job where project_id = #{projectId} and `name` = #{name}"})
    Long getByNameWithProjectId(@Param("name") String name, @Param("projectId") Long projectId);

    @Select({"select * from cron_job where project_id = #{projectId}"})
    List<CronJob> getByProject(@Param("projectId") Long projectId);

    @Select({"select * from cron_job where job_status = 'started'"})
    List<CronJob> getStartedJobs();

    @Delete({"delete from `cron_job` where project_id = #{projectId}"})
    int deleteByProject(@Param("projectId") Long projectId);
}