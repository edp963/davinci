package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelRoleProject;
import edp.davinci.core.dao.entity.RelRoleProjectExample;
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
public interface RelRoleProjectMapper {
    @SelectProvider(type=RelRoleProjectSqlProvider.class, method="countByExample")
    long countByExample(RelRoleProjectExample example);

    @DeleteProvider(type=RelRoleProjectSqlProvider.class, method="deleteByExample")
    int deleteByExample(RelRoleProjectExample example);

    @Delete({
        "delete from rel_role_project",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into rel_role_project (id, project_id, ",
        "role_id, source_permission, ",
        "view_permission, widget_permission, ",
        "viz_permission, schedule_permission, ",
        "share_permission, download_permission, ",
        "create_by, create_time, ",
        "update_by, update_time)",
        "values (#{id,jdbcType=BIGINT}, #{projectId,jdbcType=BIGINT}, ",
        "#{roleId,jdbcType=BIGINT}, #{sourcePermission,jdbcType=SMALLINT}, ",
        "#{viewPermission,jdbcType=SMALLINT}, #{widgetPermission,jdbcType=SMALLINT}, ",
        "#{vizPermission,jdbcType=SMALLINT}, #{schedulePermission,jdbcType=SMALLINT}, ",
        "#{sharePermission,jdbcType=BIT}, #{downloadPermission,jdbcType=BIT}, ",
        "#{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(RelRoleProject record);

    @InsertProvider(type=RelRoleProjectSqlProvider.class, method="insertSelective")
    int insertSelective(RelRoleProject record);

    @SelectProvider(type=RelRoleProjectSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT),
        @Result(column="source_permission", property="sourcePermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="view_permission", property="viewPermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="widget_permission", property="widgetPermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="viz_permission", property="vizPermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="schedule_permission", property="schedulePermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="share_permission", property="sharePermission", jdbcType=JdbcType.BIT),
        @Result(column="download_permission", property="downloadPermission", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<RelRoleProject> selectByExample(RelRoleProjectExample example);

    @Select({
        "select",
        "id, project_id, role_id, source_permission, view_permission, widget_permission, ",
        "viz_permission, schedule_permission, share_permission, download_permission, ",
        "create_by, create_time, update_by, update_time",
        "from rel_role_project",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="project_id", property="projectId", jdbcType=JdbcType.BIGINT),
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT),
        @Result(column="source_permission", property="sourcePermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="view_permission", property="viewPermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="widget_permission", property="widgetPermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="viz_permission", property="vizPermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="schedule_permission", property="schedulePermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="share_permission", property="sharePermission", jdbcType=JdbcType.BIT),
        @Result(column="download_permission", property="downloadPermission", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    RelRoleProject selectByPrimaryKey(Long id);

    @UpdateProvider(type=RelRoleProjectSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") RelRoleProject record, @Param("example") RelRoleProjectExample example);

    @UpdateProvider(type=RelRoleProjectSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") RelRoleProject record, @Param("example") RelRoleProjectExample example);

    @UpdateProvider(type=RelRoleProjectSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(RelRoleProject record);

    @Update({
        "update rel_role_project",
        "set project_id = #{projectId,jdbcType=BIGINT},",
          "role_id = #{roleId,jdbcType=BIGINT},",
          "source_permission = #{sourcePermission,jdbcType=SMALLINT},",
          "view_permission = #{viewPermission,jdbcType=SMALLINT},",
          "widget_permission = #{widgetPermission,jdbcType=SMALLINT},",
          "viz_permission = #{vizPermission,jdbcType=SMALLINT},",
          "schedule_permission = #{schedulePermission,jdbcType=SMALLINT},",
          "share_permission = #{sharePermission,jdbcType=BIT},",
          "download_permission = #{downloadPermission,jdbcType=BIT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(RelRoleProject record);
}