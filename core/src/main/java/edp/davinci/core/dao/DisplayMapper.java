package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Display;
import edp.davinci.core.dao.entity.DisplayExample;
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
public interface DisplayMapper {
    @SelectProvider(type=DisplaySqlProvider.class, method="countByExample")
    long countByExample(DisplayExample example);

    @DeleteProvider(type=DisplaySqlProvider.class, method="deleteByExample")
    int deleteByExample(DisplayExample example);

    @Delete({
        "delete from display",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into display (id, `name`, ",
        "description, project_id, ",
        "avatar, publish, config, ",
        "create_by, create_time, ",
        "update_by, update_time)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{description,jdbcType=VARCHAR}, #{projectId,jdbcType=BIGINT}, ",
        "#{avatar,jdbcType=VARCHAR}, #{publish,jdbcType=BIT}, #{config,jdbcType=VARCHAR}, ",
        "#{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(Display record);

    @InsertProvider(type=DisplaySqlProvider.class, method="insertSelective")
    int insertSelective(Display record);

    @SelectProvider(type=DisplaySqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="avatar", property="avatar", jdbcType=JdbcType.VARCHAR),
        @Result(column="publish", property="publish", jdbcType=JdbcType.BIT),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<Display> selectByExample(DisplayExample example);

    @Select({
        "select",
        "id, `name`, description, project_id, avatar, publish, config, create_by, create_time, ",
        "update_by, update_time",
        "from display",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="avatar", property="avatar", jdbcType=JdbcType.VARCHAR),
        @Result(column="publish", property="publish", jdbcType=JdbcType.BIT),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    Display selectByPrimaryKey(Long id);

    @UpdateProvider(type=DisplaySqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") Display record, @Param("example") DisplayExample example);

    @UpdateProvider(type=DisplaySqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") Display record, @Param("example") DisplayExample example);

    @UpdateProvider(type=DisplaySqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(Display record);

    @Update({
        "update display",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "project_id = #{projectId,jdbcType=BIGINT},",
          "avatar = #{avatar,jdbcType=VARCHAR},",
          "publish = #{publish,jdbcType=BIT},",
          "config = #{config,jdbcType=VARCHAR},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(Display record);
}