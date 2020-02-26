package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Widget;
import edp.davinci.core.dao.entity.WidgetExample;
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
public interface WidgetMapper {
    @SelectProvider(type=WidgetSqlProvider.class, method="countByExample")
    long countByExample(WidgetExample example);

    @DeleteProvider(type=WidgetSqlProvider.class, method="deleteByExample")
    int deleteByExample(WidgetExample example);

    @Delete({
        "delete from widget",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into widget (id, `name`, ",
        "description, view_id, ",
        "project_id, `type`, publish, ",
        "create_by, create_time, ",
        "update_by, update_time, ",
        "parent_id, full_parent_id, ",
        "is_folder, `index`, config)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{description,jdbcType=VARCHAR}, #{viewId,jdbcType=BIGINT}, ",
        "#{projectId,jdbcType=BIGINT}, #{type,jdbcType=BIGINT}, #{publish,jdbcType=BIT}, ",
        "#{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP}, ",
        "#{parentId,jdbcType=BIGINT}, #{fullParentId,jdbcType=VARCHAR}, ",
        "#{isFolder,jdbcType=BIT}, #{index,jdbcType=INTEGER}, #{config,jdbcType=LONGVARCHAR})"
    })
    int insert(Widget record);

    @InsertProvider(type=WidgetSqlProvider.class, method="insertSelective")
    int insertSelective(Widget record);

    @SelectProvider(type=WidgetSqlProvider.class, method="selectByExampleWithBLOBs")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="view_id", property="viewId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="type", property="type", jdbcType=JdbcType.BIGINT),
        @Result(column="publish", property="publish", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="is_folder", property="isFolder", jdbcType=JdbcType.BIT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="config", property="config", jdbcType=JdbcType.LONGVARCHAR)
    })
    List<Widget> selectByExampleWithBLOBs(WidgetExample example);

    @SelectProvider(type=WidgetSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="view_id", property="viewId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="type", property="type", jdbcType=JdbcType.BIGINT),
        @Result(column="publish", property="publish", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="is_folder", property="isFolder", jdbcType=JdbcType.BIT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER)
    })
    List<Widget> selectByExample(WidgetExample example);

    @Select({
        "select",
        "id, `name`, description, view_id, project_id, `type`, publish, create_by, create_time, ",
        "update_by, update_time, parent_id, full_parent_id, is_folder, `index`, config",
        "from widget",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="view_id", property="viewId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="type", property="type", jdbcType=JdbcType.BIGINT),
        @Result(column="publish", property="publish", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="is_folder", property="isFolder", jdbcType=JdbcType.BIT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="config", property="config", jdbcType=JdbcType.LONGVARCHAR)
    })
    Widget selectByPrimaryKey(Long id);

    @UpdateProvider(type=WidgetSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") Widget record, @Param("example") WidgetExample example);

    @UpdateProvider(type=WidgetSqlProvider.class, method="updateByExampleWithBLOBs")
    int updateByExampleWithBLOBs(@Param("record") Widget record, @Param("example") WidgetExample example);

    @UpdateProvider(type=WidgetSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") Widget record, @Param("example") WidgetExample example);

    @UpdateProvider(type=WidgetSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(Widget record);

    @Update({
        "update widget",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "view_id = #{viewId,jdbcType=BIGINT},",
          "project_id = #{projectId,jdbcType=BIGINT},",
          "`type` = #{type,jdbcType=BIGINT},",
          "publish = #{publish,jdbcType=BIT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP},",
          "parent_id = #{parentId,jdbcType=BIGINT},",
          "full_parent_id = #{fullParentId,jdbcType=VARCHAR},",
          "is_folder = #{isFolder,jdbcType=BIT},",
          "`index` = #{index,jdbcType=INTEGER},",
          "config = #{config,jdbcType=LONGVARCHAR}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKeyWithBLOBs(Widget record);

    @Update({
        "update widget",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "view_id = #{viewId,jdbcType=BIGINT},",
          "project_id = #{projectId,jdbcType=BIGINT},",
          "`type` = #{type,jdbcType=BIGINT},",
          "publish = #{publish,jdbcType=BIT},",
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
    int updateByPrimaryKey(Widget record);
}