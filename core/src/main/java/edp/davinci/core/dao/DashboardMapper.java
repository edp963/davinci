package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Dashboard;
import edp.davinci.core.dao.entity.DashboardExample;
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
public interface DashboardMapper {
    @SelectProvider(type=DashboardSqlProvider.class, method="countByExample")
    long countByExample(DashboardExample example);

    @DeleteProvider(type=DashboardSqlProvider.class, method="deleteByExample")
    int deleteByExample(DashboardExample example);

    @Delete({
        "delete from dashboard",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into dashboard (id, `name`, ",
        "dashboard_portal_id, `type`, ",
        "`index`, parent_id, ",
        "config, full_parent_id, ",
        "create_by, create_time, ",
        "update_by, update_time)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{dashboardPortalId,jdbcType=BIGINT}, #{type,jdbcType=SMALLINT}, ",
        "#{index,jdbcType=INTEGER}, #{parentId,jdbcType=BIGINT}, ",
        "#{config,jdbcType=VARCHAR}, #{fullParentId,jdbcType=VARCHAR}, ",
        "#{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(Dashboard record);

    @InsertProvider(type=DashboardSqlProvider.class, method="insertSelective")
    int insertSelective(Dashboard record);

    @SelectProvider(type=DashboardSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="dashboard_portal_id", property="dashboardPortalId", jdbcType=JdbcType.BIGINT),
        @Result(column="type", property="type", jdbcType=JdbcType.SMALLINT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<Dashboard> selectByExample(DashboardExample example);

    @Select({
        "select",
        "id, `name`, dashboard_portal_id, `type`, `index`, parent_id, config, full_parent_id, ",
        "create_by, create_time, update_by, update_time",
        "from dashboard",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="dashboard_portal_id", property="dashboardPortalId", jdbcType=JdbcType.BIGINT),
        @Result(column="type", property="type", jdbcType=JdbcType.SMALLINT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="parent_id", property="parentId", jdbcType=JdbcType.BIGINT),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="full_parent_id", property="fullParentId", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    Dashboard selectByPrimaryKey(Long id);

    @UpdateProvider(type=DashboardSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") Dashboard record, @Param("example") DashboardExample example);

    @UpdateProvider(type=DashboardSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") Dashboard record, @Param("example") DashboardExample example);

    @UpdateProvider(type=DashboardSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(Dashboard record);

    @Update({
        "update dashboard",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "dashboard_portal_id = #{dashboardPortalId,jdbcType=BIGINT},",
          "`type` = #{type,jdbcType=SMALLINT},",
          "`index` = #{index,jdbcType=INTEGER},",
          "parent_id = #{parentId,jdbcType=BIGINT},",
          "config = #{config,jdbcType=VARCHAR},",
          "full_parent_id = #{fullParentId,jdbcType=VARCHAR},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(Dashboard record);
}