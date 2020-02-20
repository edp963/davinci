package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.core.dao.entity.CronJobExample;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface CronJobMapper {
    long countByExample(CronJobExample example);

    int deleteByExample(CronJobExample example);

    @Delete({
        "delete from cron_job",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into cron_job (id, name, ",
        "project_id, job_type, ",
        "job_status, cron_expression, ",
        "start_date, end_date, ",
        "config, description, ",
        "exec_log, create_by, ",
        "create_time, update_by, ",
        "update_time, parent_id, ",
        "full_parent_id, is_folder, ",
        "index)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{projectId,jdbcType=BIGINT}, #{jobType,jdbcType=VARCHAR}, ",
        "#{jobStatus,jdbcType=VARCHAR}, #{cronExpression,jdbcType=VARCHAR}, ",
        "#{startDate,jdbcType=TIMESTAMP}, #{endDate,jdbcType=TIMESTAMP}, ",
        "#{config,jdbcType=VARCHAR}, #{description,jdbcType=VARCHAR}, ",
        "#{execLog,jdbcType=VARCHAR}, #{createBy,jdbcType=BIGINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{updateBy,jdbcType=VARCHAR}, ",
        "#{updateTime,jdbcType=TIMESTAMP}, #{parentId,jdbcType=BIGINT}, ",
        "#{fullParentId,jdbcType=VARCHAR}, #{isFolder,jdbcType=BIT}, ",
        "#{index,jdbcType=INTEGER})"
    })
    int insert(CronJob record);

    int insertSelective(CronJob record);

    List<CronJob> selectByExample(CronJobExample example);

    @Select({
        "select",
        "id, name, project_id, job_type, job_status, cron_expression, start_date, end_date, ",
        "config, description, exec_log, create_by, create_time, update_by, update_time, ",
        "parent_id, full_parent_id, is_folder, index",
        "from cron_job",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @ResultMap("edp.davinci.core.dao.CronJobMapper.BaseResultMap")
    CronJob selectByPrimaryKey(Long id);

    int updateByExampleSelective(@Param("record") CronJob record, @Param("example") CronJobExample example);

    int updateByExample(@Param("record") CronJob record, @Param("example") CronJobExample example);

    int updateByPrimaryKeySelective(CronJob record);

    @Update({
        "update cron_job",
        "set name = #{name,jdbcType=VARCHAR},",
          "project_id = #{projectId,jdbcType=BIGINT},",
          "job_type = #{jobType,jdbcType=VARCHAR},",
          "job_status = #{jobStatus,jdbcType=VARCHAR},",
          "cron_expression = #{cronExpression,jdbcType=VARCHAR},",
          "start_date = #{startDate,jdbcType=TIMESTAMP},",
          "end_date = #{endDate,jdbcType=TIMESTAMP},",
          "config = #{config,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "exec_log = #{execLog,jdbcType=VARCHAR},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=VARCHAR},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP},",
          "parent_id = #{parentId,jdbcType=BIGINT},",
          "full_parent_id = #{fullParentId,jdbcType=VARCHAR},",
          "is_folder = #{isFolder,jdbcType=BIT},",
          "index = #{index,jdbcType=INTEGER}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(CronJob record);
}