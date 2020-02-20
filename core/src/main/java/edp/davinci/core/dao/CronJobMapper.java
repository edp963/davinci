package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.core.dao.entity.CronJobExample;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.DeleteProvider;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.InsertProvider;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.SelectProvider;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.UpdateProvider;
import org.apache.ibatis.type.JdbcType;

@Mapper
public interface CronJobMapper {
    @SelectProvider(type=CronJobSqlProvider.class, method="countByExample")
    long countByExample(CronJobExample example);

    @DeleteProvider(type=CronJobSqlProvider.class, method="deleteByExample")
    int deleteByExample(CronJobExample example);

    @Delete({
        "delete from cron_job",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into cron_job (id, `name`, ",
        "project_id, job_type, ",
        "job_status, cron_expression, ",
        "start_date, end_date, ",
        "config, description, ",
        "exec_log, create_by, ",
        "create_time, update_by, ",
        "update_time, parent_id, ",
        "full_parent_id, is_folder, ",
        "`index`)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{projectId,jdbcType=BIGINT}, #{jobType,jdbcType=VARCHAR}, ",
        "#{jobStatus,jdbcType=VARCHAR}, #{cronExpression,jdbcType=VARCHAR}, ",
        "#{startDate,jdbcType=TIMESTAMP}, #{endDate,jdbcType=TIMESTAMP}, ",
        "#{config,jdbcType=VARCHAR}, #{description,jdbcType=VARCHAR}, ",
        "#{execLog,jdbcType=VARCHAR}, #{createBy,jdbcType=BIGINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{updateBy,jdbcType=BIGINT}, ",
        "#{updateTime,jdbcType=TIMESTAMP}, #{parentId,jdbcType=BIGINT}, ",
        "#{fullParentId,jdbcType=VARCHAR}, #{isFolder,jdbcType=BIT}, ",
        "#{index,jdbcType=INTEGER})"
    })
    int insert(CronJob record);

    @InsertProvider(type=CronJobSqlProvider.class, method="insertSelective")
    int insertSelective(CronJob record);

    @SelectProvider(type=CronJobSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="job_type", property="jobType", jdbcType=JdbcType.VARCHAR),
        @Result(column="job_status", property="jobStatus", jdbcType=JdbcType.VARCHAR),
        @Result(column="cron_expression", property="cronExpression", jdbcType=JdbcType.VARCHAR),
        @Result(column="start_date", property="startDate", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="end_date", property="endDate", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="exec_log", property="execLog", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="is_folder", property="isFolder", jdbcType=JdbcType.BIT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER)
    })
    List<CronJob> selectByExample(CronJobExample example);

    @Select({
        "select",
        "id, `name`, project_id, job_type, job_status, cron_expression, start_date, end_date, ",
        "config, description, exec_log, create_by, create_time, update_by, update_time, ",
        "parent_id, full_parent_id, is_folder, `index`",
        "from cron_job",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="job_type", property="jobType", jdbcType=JdbcType.VARCHAR),
        @Result(column="job_status", property="jobStatus", jdbcType=JdbcType.VARCHAR),
        @Result(column="cron_expression", property="cronExpression", jdbcType=JdbcType.VARCHAR),
        @Result(column="start_date", property="startDate", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="end_date", property="endDate", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="exec_log", property="execLog", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="is_folder", property="isFolder", jdbcType=JdbcType.BIT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER)
    })
    CronJob selectByPrimaryKey(Long id);

    @UpdateProvider(type=CronJobSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") CronJob record, @Param("example") CronJobExample example);

    @UpdateProvider(type=CronJobSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") CronJob record, @Param("example") CronJobExample example);

    @UpdateProvider(type=CronJobSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(CronJob record);

    @Update({
        "update cron_job",
        "set `name` = #{name,jdbcType=VARCHAR},",
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
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP},",
          "parent_id = #{parentId,jdbcType=BIGINT},",
          "full_parent_id = #{fullParentId,jdbcType=VARCHAR},",
          "is_folder = #{isFolder,jdbcType=BIT},",
          "`index` = #{index,jdbcType=INTEGER}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(CronJob record);
}