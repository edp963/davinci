package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Source;
import edp.davinci.core.dao.entity.SourceExample;
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
public interface SourceMapper {
    @SelectProvider(type=SourceSqlProvider.class, method="countByExample")
    long countByExample(SourceExample example);

    @DeleteProvider(type=SourceSqlProvider.class, method="deleteByExample")
    int deleteByExample(SourceExample example);

    @Delete({
        "delete from source",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into source (id, `name`, ",
        "description, config, ",
        "`type`, project_id, ",
        "create_by, create_time, ",
        "update_by, update_time, ",
        "parent_id, full_parent_id, ",
        "is_folder, `index`)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{description,jdbcType=VARCHAR}, #{config,jdbcType=VARCHAR}, ",
        "#{type,jdbcType=VARCHAR}, #{projectId,jdbcType=BIGINT}, ",
        "#{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP}, ",
        "#{parentId,jdbcType=BIGINT}, #{fullParentId,jdbcType=VARCHAR}, ",
        "#{isFolder,jdbcType=BIT}, #{index,jdbcType=INTEGER})"
    })
    int insert(Source record);

    @InsertProvider(type=SourceSqlProvider.class, method="insertSelective")
    int insertSelective(Source record);

    @SelectProvider(type=SourceSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="type", property="type", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="is_folder", property="isFolder", jdbcType=JdbcType.BIT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER)
    })
    List<Source> selectByExample(SourceExample example);

    @Select({
        "select",
        "id, `name`, description, config, `type`, project_id, create_by, create_time, ",
        "update_by, update_time, parent_id, full_parent_id, is_folder, `index`",
        "from source",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="type", property="type", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="is_folder", property="isFolder", jdbcType=JdbcType.BIT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER)
    })
    Source selectByPrimaryKey(Long id);

    @UpdateProvider(type=SourceSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") Source record, @Param("example") SourceExample example);

    @UpdateProvider(type=SourceSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") Source record, @Param("example") SourceExample example);

    @UpdateProvider(type=SourceSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(Source record);

    @Update({
        "update source",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "config = #{config,jdbcType=VARCHAR},",
          "`type` = #{type,jdbcType=VARCHAR},",
          "project_id = #{projectId,jdbcType=BIGINT},",
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
    int updateByPrimaryKey(Source record);
}