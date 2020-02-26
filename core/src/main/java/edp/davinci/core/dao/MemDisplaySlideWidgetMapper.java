package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.MemDisplaySlideWidget;
import edp.davinci.core.dao.entity.MemDisplaySlideWidgetExample;
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
public interface MemDisplaySlideWidgetMapper {
    @SelectProvider(type=MemDisplaySlideWidgetSqlProvider.class, method="countByExample")
    long countByExample(MemDisplaySlideWidgetExample example);

    @DeleteProvider(type=MemDisplaySlideWidgetSqlProvider.class, method="deleteByExample")
    int deleteByExample(MemDisplaySlideWidgetExample example);

    @Delete({
        "delete from mem_display_slide_widget",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into mem_display_slide_widget (id, display_slide_id, ",
        "widget_id, `name`, `type`, ",
        "sub_type, `index`, ",
        "create_by, create_time, ",
        "update_by, update_time, ",
        "params)",
        "values (#{id,jdbcType=BIGINT}, #{displaySlideId,jdbcType=BIGINT}, ",
        "#{widgetId,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, #{type,jdbcType=SMALLINT}, ",
        "#{subType,jdbcType=SMALLINT}, #{index,jdbcType=INTEGER}, ",
        "#{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP}, ",
        "#{params,jdbcType=LONGVARCHAR})"
    })
    int insert(MemDisplaySlideWidget record);

    @InsertProvider(type=MemDisplaySlideWidgetSqlProvider.class, method="insertSelective")
    int insertSelective(MemDisplaySlideWidget record);

    @SelectProvider(type=MemDisplaySlideWidgetSqlProvider.class, method="selectByExampleWithBLOBs")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="display_slide_id", property="displaySlideId", jdbcType=JdbcType.BIGINT),
        @Result(column="widget_id", property="widgetId", jdbcType=JdbcType.BIGINT),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="type", property="type", jdbcType=JdbcType.SMALLINT),
        @Result(column="sub_type", property="subType", jdbcType=JdbcType.SMALLINT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="params", property="params", jdbcType=JdbcType.LONGVARCHAR)
    })
    List<MemDisplaySlideWidget> selectByExampleWithBLOBs(MemDisplaySlideWidgetExample example);

    @SelectProvider(type=MemDisplaySlideWidgetSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="display_slide_id", property="displaySlideId", jdbcType=JdbcType.BIGINT),
        @Result(column="widget_id", property="widgetId", jdbcType=JdbcType.BIGINT),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="type", property="type", jdbcType=JdbcType.SMALLINT),
        @Result(column="sub_type", property="subType", jdbcType=JdbcType.SMALLINT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<MemDisplaySlideWidget> selectByExample(MemDisplaySlideWidgetExample example);

    @Select({
        "select",
        "id, display_slide_id, widget_id, `name`, `type`, sub_type, `index`, create_by, ",
        "create_time, update_by, update_time, params",
        "from mem_display_slide_widget",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="display_slide_id", property="displaySlideId", jdbcType=JdbcType.BIGINT),
        @Result(column="widget_id", property="widgetId", jdbcType=JdbcType.BIGINT),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="type", property="type", jdbcType=JdbcType.SMALLINT),
        @Result(column="sub_type", property="subType", jdbcType=JdbcType.SMALLINT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="params", property="params", jdbcType=JdbcType.LONGVARCHAR)
    })
    MemDisplaySlideWidget selectByPrimaryKey(Long id);

    @UpdateProvider(type=MemDisplaySlideWidgetSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") MemDisplaySlideWidget record, @Param("example") MemDisplaySlideWidgetExample example);

    @UpdateProvider(type=MemDisplaySlideWidgetSqlProvider.class, method="updateByExampleWithBLOBs")
    int updateByExampleWithBLOBs(@Param("record") MemDisplaySlideWidget record, @Param("example") MemDisplaySlideWidgetExample example);

    @UpdateProvider(type=MemDisplaySlideWidgetSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") MemDisplaySlideWidget record, @Param("example") MemDisplaySlideWidgetExample example);

    @UpdateProvider(type=MemDisplaySlideWidgetSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(MemDisplaySlideWidget record);

    @Update({
        "update mem_display_slide_widget",
        "set display_slide_id = #{displaySlideId,jdbcType=BIGINT},",
          "widget_id = #{widgetId,jdbcType=BIGINT},",
          "`name` = #{name,jdbcType=VARCHAR},",
          "`type` = #{type,jdbcType=SMALLINT},",
          "sub_type = #{subType,jdbcType=SMALLINT},",
          "`index` = #{index,jdbcType=INTEGER},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP},",
          "params = #{params,jdbcType=LONGVARCHAR}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKeyWithBLOBs(MemDisplaySlideWidget record);

    @Update({
        "update mem_display_slide_widget",
        "set display_slide_id = #{displaySlideId,jdbcType=BIGINT},",
          "widget_id = #{widgetId,jdbcType=BIGINT},",
          "`name` = #{name,jdbcType=VARCHAR},",
          "`type` = #{type,jdbcType=SMALLINT},",
          "sub_type = #{subType,jdbcType=SMALLINT},",
          "`index` = #{index,jdbcType=INTEGER},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(MemDisplaySlideWidget record);
}