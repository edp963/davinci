package edp.davinci.dao;

import edp.davinci.dto.projectDto.UserMaxProjectPermission;
import edp.davinci.model.RelRoleProject;
import edp.davinci.model.RelRoleUser;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.Set;

public interface RelRoleProjectMapper {

    int insert(RelRoleProject record);

    @Delete({
            "delete from rel_role_project where id = #{relationId}"
    })
    int deleteById(@Param("relationId") Long relationId);

    @Delete({
            "delete from rel_role_project where project_id = #{projectId}"
    })
    int deleteByProjectId(@Param("projectId") Long projectId);


    @Select({
            "select * from rel_role_project where id = #{id,jdbcType=BIGINT}"
    })
    RelRoleProject getById(Long id);

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
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(RelRoleProject record);

    @Select({
            "select * from rel_role_project where role_id = #{roleId} and project_id = #{projectId}"
    })
    RelRoleProject getByRoleAndProject(@Param("roleId") Long roleId, @Param("projectId") Long projectId);

    List<UserMaxProjectPermission> getMaxPermissions(@Param("projectIds") Set<Long> projectIds, @Param("userId") Long userId);

    UserMaxProjectPermission getMaxPermission(@Param("projectId") Long projectId, @Param("userId") Long userId);

    int insertBatch(@Param("list") List<RelRoleProject> list);
}