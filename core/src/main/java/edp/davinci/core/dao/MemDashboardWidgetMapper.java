package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.MemDashboardWidget;
import edp.davinci.core.dao.entity.MemDashboardWidgetExample;
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
public interface MemDashboardWidgetMapper {
    @SelectProvider(type=MemDashboardWidgetSqlProvider.class, method="countByExample")
    long countByExample(MemDashboardWidgetExample example);

    @DeleteProvider(type=MemDashboardWidgetSqlProvider.class, method="deleteByExample")
    int deleteByExample(MemDashboardWidgetExample example);

    @Delete({
        "delete from mem_dashboard_widget",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into mem_dashboard_widget (id, `alias`, ",
        "dashboard_id, widget_Id, ",
        "x, y, width, ",
        "height, polling, frequency, ",
        "config, create_by, ",
        "create_time, update_by, ",
        "update_time)",
        "values (#{id,jdbcType=BIGINT}, #{alias,jdbcType=VARCHAR}, ",
        "#{dashboardId,jdbcType=BIGINT}, #{widgetId,jdbcType=BIGINT}, ",
        "#{x,jdbcType=INTEGER}, #{y,jdbcType=INTEGER}, #{width,jdbcType=INTEGER}, ",
        "#{height,jdbcType=INTEGER}, #{polling,jdbcType=BIT}, #{frequency,jdbcType=INTEGER}, ",
        "#{config,jdbcType=VARCHAR}, #{createBy,jdbcType=BIGINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{updateBy,jdbcType=BIGINT}, ",
        "#{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(MemDashboardWidget record);

    @InsertProvider(type=MemDashboardWidgetSqlProvider.class, method="insertSelective")
    int insertSelective(MemDashboardWidget record);

    @SelectProvider(type=MemDashboardWidgetSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="alias", property="alias", jdbcType=JdbcType.VARCHAR),
        @Result(column="dashboard_id", property="dashboardId", jdbcType=JdbcType.BIGINT),
        @Result(column="widget_Id", property="widgetId", jdbcType=JdbcType.BIGINT),
        @Result(column="x", property="x", jdbcType=JdbcType.INTEGER),
        @Result(column="y", property="y", jdbcType=JdbcType.INTEGER),
        @Result(column="width", property="width", jdbcType=JdbcType.INTEGER),
        @Result(column="height", property="height", jdbcType=JdbcType.INTEGER),
        @Result(column="polling", property="polling", jdbcType=JdbcType.BIT),
        @Result(column="frequency", property="frequency", jdbcType=JdbcType.INTEGER),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<MemDashboardWidget> selectByExample(MemDashboardWidgetExample example);

    @Select({
        "select",
        "id, `alias`, dashboard_id, widget_Id, x, y, width, height, polling, frequency, ",
        "config, create_by, create_time, update_by, update_time",
        "from mem_dashboard_widget",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="alias", property="alias", jdbcType=JdbcType.VARCHAR),
        @Result(column="dashboard_id", property="dashboardId", jdbcType=JdbcType.BIGINT),
        @Result(column="widget_Id", property="widgetId", jdbcType=JdbcType.BIGINT),
        @Result(column="x", property="x", jdbcType=JdbcType.INTEGER),
        @Result(column="y", property="y", jdbcType=JdbcType.INTEGER),
        @Result(column="width", property="width", jdbcType=JdbcType.INTEGER),
        @Result(column="height", property="height", jdbcType=JdbcType.INTEGER),
        @Result(column="polling", property="polling", jdbcType=JdbcType.BIT),
        @Result(column="frequency", property="frequency", jdbcType=JdbcType.INTEGER),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    MemDashboardWidget selectByPrimaryKey(Long id);

    @UpdateProvider(type=MemDashboardWidgetSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") MemDashboardWidget record, @Param("example") MemDashboardWidgetExample example);

    @UpdateProvider(type=MemDashboardWidgetSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") MemDashboardWidget record, @Param("example") MemDashboardWidgetExample example);

    @UpdateProvider(type=MemDashboardWidgetSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(MemDashboardWidget record);

    @Update({
        "update mem_dashboard_widget",
        "set `alias` = #{alias,jdbcType=VARCHAR},",
          "dashboard_id = #{dashboardId,jdbcType=BIGINT},",
          "widget_Id = #{widgetId,jdbcType=BIGINT},",
          "x = #{x,jdbcType=INTEGER},",
          "y = #{y,jdbcType=INTEGER},",
          "width = #{width,jdbcType=INTEGER},",
          "height = #{height,jdbcType=INTEGER},",
          "polling = #{polling,jdbcType=BIT},",
          "frequency = #{frequency,jdbcType=INTEGER},",
          "config = #{config,jdbcType=VARCHAR},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(MemDashboardWidget record);
}