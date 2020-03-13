package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelRoleDashboard;
import edp.davinci.core.dao.entity.RelRoleDashboardExample;
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
public interface RelRoleDashboardMapper {
    @SelectProvider(type=RelRoleDashboardSqlProvider.class, method="countByExample")
    long countByExample(RelRoleDashboardExample example);

    @DeleteProvider(type=RelRoleDashboardSqlProvider.class, method="deleteByExample")
    int deleteByExample(RelRoleDashboardExample example);

    @Delete({
        "delete from rel_role_dashboard",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and dashboard_id = #{dashboardId,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(@Param("roleId") Long roleId, @Param("dashboardId") Long dashboardId);

    @Insert({
        "insert into rel_role_dashboard (role_id, dashboard_id, ",
        "visible, create_by, create_time, ",
        "update_by, update_time)",
        "values (#{roleId,jdbcType=BIGINT}, #{dashboardId,jdbcType=BIGINT}, ",
        "#{visible,jdbcType=BIT}, #{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(RelRoleDashboard record);

    @InsertProvider(type=RelRoleDashboardSqlProvider.class, method="insertSelective")
    int insertSelective(RelRoleDashboard record);

    @SelectProvider(type=RelRoleDashboardSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="dashboard_id", property="dashboardId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<RelRoleDashboard> selectByExample(RelRoleDashboardExample example);

    @Select({
        "select",
        "role_id, dashboard_id, visible, create_by, create_time, update_by, update_time",
        "from rel_role_dashboard",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and dashboard_id = #{dashboardId,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="dashboard_id", property="dashboardId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    RelRoleDashboard selectByPrimaryKey(@Param("roleId") Long roleId, @Param("dashboardId") Long dashboardId);

    @UpdateProvider(type=RelRoleDashboardSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") RelRoleDashboard record, @Param("example") RelRoleDashboardExample example);

    @UpdateProvider(type=RelRoleDashboardSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") RelRoleDashboard record, @Param("example") RelRoleDashboardExample example);

    @UpdateProvider(type=RelRoleDashboardSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(RelRoleDashboard record);

    @Update({
        "update rel_role_dashboard",
        "set visible = #{visible,jdbcType=BIT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and dashboard_id = #{dashboardId,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(RelRoleDashboard record);
}