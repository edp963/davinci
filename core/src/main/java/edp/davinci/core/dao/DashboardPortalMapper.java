package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.DashboardPortal;
import edp.davinci.core.dao.entity.DashboardPortalExample;
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
public interface DashboardPortalMapper {
    @SelectProvider(type=DashboardPortalSqlProvider.class, method="countByExample")
    long countByExample(DashboardPortalExample example);

    @DeleteProvider(type=DashboardPortalSqlProvider.class, method="deleteByExample")
    int deleteByExample(DashboardPortalExample example);

    @Delete({
        "delete from dashboard_portal",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into dashboard_portal (id, `name`, ",
        "description, project_id, ",
        "avatar, publish, create_by, ",
        "create_time, update_by, ",
        "update_time)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{description,jdbcType=VARCHAR}, #{projectId,jdbcType=BIGINT}, ",
        "#{avatar,jdbcType=VARCHAR}, #{publish,jdbcType=BIT}, #{createBy,jdbcType=BIGINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{updateBy,jdbcType=BIGINT}, ",
        "#{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(DashboardPortal record);

    @InsertProvider(type=DashboardPortalSqlProvider.class, method="insertSelective")
    int insertSelective(DashboardPortal record);

    @SelectProvider(type=DashboardPortalSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="avatar", property="avatar", jdbcType=JdbcType.VARCHAR),
        @Result(column="publish", property="publish", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<DashboardPortal> selectByExample(DashboardPortalExample example);

    @Select({
        "select",
        "id, `name`, description, project_id, avatar, publish, create_by, create_time, ",
        "update_by, update_time",
        "from dashboard_portal",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="avatar", property="avatar", jdbcType=JdbcType.VARCHAR),
        @Result(column="publish", property="publish", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    DashboardPortal selectByPrimaryKey(Long id);

    @UpdateProvider(type=DashboardPortalSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") DashboardPortal record, @Param("example") DashboardPortalExample example);

    @UpdateProvider(type=DashboardPortalSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") DashboardPortal record, @Param("example") DashboardPortalExample example);

    @UpdateProvider(type=DashboardPortalSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(DashboardPortal record);

    @Update({
        "update dashboard_portal",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "project_id = #{projectId,jdbcType=BIGINT},",
          "avatar = #{avatar,jdbcType=VARCHAR},",
          "publish = #{publish,jdbcType=BIT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(DashboardPortal record);
}