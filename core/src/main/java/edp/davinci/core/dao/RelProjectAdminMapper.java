package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelProjectAdmin;
import edp.davinci.core.dao.entity.RelProjectAdminExample;
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
public interface RelProjectAdminMapper {
    @SelectProvider(type=RelProjectAdminSqlProvider.class, method="countByExample")
    long countByExample(RelProjectAdminExample example);

    @DeleteProvider(type=RelProjectAdminSqlProvider.class, method="deleteByExample")
    int deleteByExample(RelProjectAdminExample example);

    @Delete({
        "delete from rel_project_admin",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into rel_project_admin (id, project_id, ",
        "user_id, create_by, ",
        "create_time, update_by, ",
        "update_time)",
        "values (#{id,jdbcType=BIGINT}, #{projectId,jdbcType=BIGINT}, ",
        "#{userId,jdbcType=BIGINT}, #{createBy,jdbcType=BIGINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{updateBy,jdbcType=BIGINT}, ",
        "#{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(RelProjectAdmin record);

    @InsertProvider(type=RelProjectAdminSqlProvider.class, method="insertSelective")
    int insertSelective(RelProjectAdmin record);

    @SelectProvider(type=RelProjectAdminSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<RelProjectAdmin> selectByExample(RelProjectAdminExample example);

    @Select({
        "select",
        "id, project_id, user_id, create_by, create_time, update_by, update_time",
        "from rel_project_admin",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    RelProjectAdmin selectByPrimaryKey(Long id);

    @UpdateProvider(type=RelProjectAdminSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") RelProjectAdmin record, @Param("example") RelProjectAdminExample example);

    @UpdateProvider(type=RelProjectAdminSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") RelProjectAdmin record, @Param("example") RelProjectAdminExample example);

    @UpdateProvider(type=RelProjectAdminSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(RelProjectAdmin record);

    @Update({
        "update rel_project_admin",
        "set project_id = #{projectId,jdbcType=BIGINT},",
          "user_id = #{userId,jdbcType=BIGINT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(RelProjectAdmin record);
}