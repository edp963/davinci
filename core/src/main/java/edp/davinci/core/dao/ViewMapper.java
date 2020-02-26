package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.View;
import edp.davinci.core.dao.entity.ViewExample;
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
public interface ViewMapper {
    @SelectProvider(type=ViewSqlProvider.class, method="countByExample")
    long countByExample(ViewExample example);

    @DeleteProvider(type=ViewSqlProvider.class, method="deleteByExample")
    int deleteByExample(ViewExample example);

    @Delete({
        "delete from view",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into view (id, `name`, ",
        "description, project_id, ",
        "source_id, create_by, ",
        "create_time, update_by, ",
        "update_time, parent_id, ",
        "full_parent_id, is_folder, ",
        "`index`, `sql`, ",
        "model, `variable`, ",
        "config)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{description,jdbcType=VARCHAR}, #{projectId,jdbcType=BIGINT}, ",
        "#{sourceId,jdbcType=BIGINT}, #{createBy,jdbcType=BIGINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{updateBy,jdbcType=BIGINT}, ",
        "#{updateTime,jdbcType=TIMESTAMP}, #{parentId,jdbcType=BIGINT}, ",
        "#{fullParentId,jdbcType=VARCHAR}, #{isFolder,jdbcType=BIT}, ",
        "#{index,jdbcType=INTEGER}, #{sql,jdbcType=LONGVARCHAR}, ",
        "#{model,jdbcType=LONGVARCHAR}, #{variable,jdbcType=LONGVARCHAR}, ",
        "#{config,jdbcType=LONGVARCHAR})"
    })
    int insert(View record);

    @InsertProvider(type=ViewSqlProvider.class, method="insertSelective")
    int insertSelective(View record);

    @SelectProvider(type=ViewSqlProvider.class, method="selectByExampleWithBLOBs")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="source_id", property="sourceId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="is_folder", property="isFolder", jdbcType=JdbcType.BIT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="sql", property="sql", jdbcType=JdbcType.LONGVARCHAR),
        @Result(column="model", property="model", jdbcType=JdbcType.LONGVARCHAR),
        @Result(column="variable", property="variable", jdbcType=JdbcType.LONGVARCHAR),
        @Result(column="config", property="config", jdbcType=JdbcType.LONGVARCHAR)
    })
    List<View> selectByExampleWithBLOBs(ViewExample example);

    @SelectProvider(type=ViewSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="source_id", property="sourceId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="is_folder", property="isFolder", jdbcType=JdbcType.BIT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER)
    })
    List<View> selectByExample(ViewExample example);

    @Select({
        "select",
        "id, `name`, description, project_id, source_id, create_by, create_time, update_by, ",
        "update_time, parent_id, full_parent_id, is_folder, `index`, `sql`, model, `variable`, ",
        "config",
        "from view",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="source_id", property="sourceId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="is_folder", property="isFolder", jdbcType=JdbcType.BIT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="sql", property="sql", jdbcType=JdbcType.LONGVARCHAR),
        @Result(column="model", property="model", jdbcType=JdbcType.LONGVARCHAR),
        @Result(column="variable", property="variable", jdbcType=JdbcType.LONGVARCHAR),
        @Result(column="config", property="config", jdbcType=JdbcType.LONGVARCHAR)
    })
    View selectByPrimaryKey(Long id);

    @UpdateProvider(type=ViewSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") View record, @Param("example") ViewExample example);

    @UpdateProvider(type=ViewSqlProvider.class, method="updateByExampleWithBLOBs")
    int updateByExampleWithBLOBs(@Param("record") View record, @Param("example") ViewExample example);

    @UpdateProvider(type=ViewSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") View record, @Param("example") ViewExample example);

    @UpdateProvider(type=ViewSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(View record);

    @Update({
        "update view",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "project_id = #{projectId,jdbcType=BIGINT},",
          "source_id = #{sourceId,jdbcType=BIGINT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP},",
          "parent_id = #{parentId,jdbcType=BIGINT},",
          "full_parent_id = #{fullParentId,jdbcType=VARCHAR},",
          "is_folder = #{isFolder,jdbcType=BIT},",
          "`index` = #{index,jdbcType=INTEGER},",
          "`sql` = #{sql,jdbcType=LONGVARCHAR},",
          "model = #{model,jdbcType=LONGVARCHAR},",
          "`variable` = #{variable,jdbcType=LONGVARCHAR},",
          "config = #{config,jdbcType=LONGVARCHAR}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKeyWithBLOBs(View record);

    @Update({
        "update view",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "project_id = #{projectId,jdbcType=BIGINT},",
          "source_id = #{sourceId,jdbcType=BIGINT},",
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
    int updateByPrimaryKey(View record);
}