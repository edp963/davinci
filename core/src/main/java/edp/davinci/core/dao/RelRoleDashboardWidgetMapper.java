package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelRoleDashboardWidget;
import edp.davinci.core.dao.entity.RelRoleDashboardWidgetExample;
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
public interface RelRoleDashboardWidgetMapper {
    @SelectProvider(type=RelRoleDashboardWidgetSqlProvider.class, method="countByExample")
    long countByExample(RelRoleDashboardWidgetExample example);

    @DeleteProvider(type=RelRoleDashboardWidgetSqlProvider.class, method="deleteByExample")
    int deleteByExample(RelRoleDashboardWidgetExample example);

    @Delete({
        "delete from rel_role_dashboard_widget",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and mem_dashboard_widget_id = #{memDashboardWidgetId,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(@Param("roleId") Long roleId, @Param("memDashboardWidgetId") Long memDashboardWidgetId);

    @Insert({
        "insert into rel_role_dashboard_widget (role_id, mem_dashboard_widget_id, ",
        "visible, create_by, create_time, ",
        "update_by, update_time)",
        "values (#{roleId,jdbcType=BIGINT}, #{memDashboardWidgetId,jdbcType=BIGINT}, ",
        "#{visible,jdbcType=BIT}, #{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(RelRoleDashboardWidget record);

    @InsertProvider(type=RelRoleDashboardWidgetSqlProvider.class, method="insertSelective")
    int insertSelective(RelRoleDashboardWidget record);

    @SelectProvider(type=RelRoleDashboardWidgetSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="mem_dashboard_widget_id", property="memDashboardWidgetId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<RelRoleDashboardWidget> selectByExample(RelRoleDashboardWidgetExample example);

    @Select({
        "select",
        "role_id, mem_dashboard_widget_id, visible, create_by, create_time, update_by, ",
        "update_time",
        "from rel_role_dashboard_widget",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and mem_dashboard_widget_id = #{memDashboardWidgetId,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="mem_dashboard_widget_id", property="memDashboardWidgetId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    RelRoleDashboardWidget selectByPrimaryKey(@Param("roleId") Long roleId, @Param("memDashboardWidgetId") Long memDashboardWidgetId);

    @UpdateProvider(type=RelRoleDashboardWidgetSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") RelRoleDashboardWidget record, @Param("example") RelRoleDashboardWidgetExample example);

    @UpdateProvider(type=RelRoleDashboardWidgetSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") RelRoleDashboardWidget record, @Param("example") RelRoleDashboardWidgetExample example);

    @UpdateProvider(type=RelRoleDashboardWidgetSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(RelRoleDashboardWidget record);

    @Update({
        "update rel_role_dashboard_widget",
        "set visible = #{visible,jdbcType=BIT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and mem_dashboard_widget_id = #{memDashboardWidgetId,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(RelRoleDashboardWidget record);
}