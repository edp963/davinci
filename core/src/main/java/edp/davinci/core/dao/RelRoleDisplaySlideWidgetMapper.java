package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelRoleDisplaySlideWidget;
import edp.davinci.core.dao.entity.RelRoleDisplaySlideWidgetExample;
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
public interface RelRoleDisplaySlideWidgetMapper {
    @SelectProvider(type=RelRoleDisplaySlideWidgetSqlProvider.class, method="countByExample")
    long countByExample(RelRoleDisplaySlideWidgetExample example);

    @DeleteProvider(type=RelRoleDisplaySlideWidgetSqlProvider.class, method="deleteByExample")
    int deleteByExample(RelRoleDisplaySlideWidgetExample example);

    @Delete({
        "delete from rel_role_display_slide_widget",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and mem_display_slide_widget_id = #{memDisplaySlideWidgetId,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(@Param("roleId") Long roleId, @Param("memDisplaySlideWidgetId") Long memDisplaySlideWidgetId);

    @Insert({
        "insert into rel_role_display_slide_widget (role_id, mem_display_slide_widget_id, ",
        "visible, create_by, create_time, ",
        "update_by, update_time)",
        "values (#{roleId,jdbcType=BIGINT}, #{memDisplaySlideWidgetId,jdbcType=BIGINT}, ",
        "#{visible,jdbcType=BIT}, #{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(RelRoleDisplaySlideWidget record);

    @InsertProvider(type=RelRoleDisplaySlideWidgetSqlProvider.class, method="insertSelective")
    int insertSelective(RelRoleDisplaySlideWidget record);

    @SelectProvider(type=RelRoleDisplaySlideWidgetSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="mem_display_slide_widget_id", property="memDisplaySlideWidgetId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<RelRoleDisplaySlideWidget> selectByExample(RelRoleDisplaySlideWidgetExample example);

    @Select({
        "select",
        "role_id, mem_display_slide_widget_id, visible, create_by, create_time, update_by, ",
        "update_time",
        "from rel_role_display_slide_widget",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and mem_display_slide_widget_id = #{memDisplaySlideWidgetId,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="mem_display_slide_widget_id", property="memDisplaySlideWidgetId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    RelRoleDisplaySlideWidget selectByPrimaryKey(@Param("roleId") Long roleId, @Param("memDisplaySlideWidgetId") Long memDisplaySlideWidgetId);

    @UpdateProvider(type=RelRoleDisplaySlideWidgetSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") RelRoleDisplaySlideWidget record, @Param("example") RelRoleDisplaySlideWidgetExample example);

    @UpdateProvider(type=RelRoleDisplaySlideWidgetSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") RelRoleDisplaySlideWidget record, @Param("example") RelRoleDisplaySlideWidgetExample example);

    @UpdateProvider(type=RelRoleDisplaySlideWidgetSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(RelRoleDisplaySlideWidget record);

    @Update({
        "update rel_role_display_slide_widget",
        "set visible = #{visible,jdbcType=BIT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and mem_display_slide_widget_id = #{memDisplaySlideWidgetId,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(RelRoleDisplaySlideWidget record);
}