package edp.davinci.dao;

import edp.davinci.model.RelRoleDashboard;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface RelRoleDashboardMapper {

    int insert(RelRoleDashboard relRoleDashboard);

    @Delete({
            "delete from rel_role_dashboard where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);


    @Select({
            "select * from rel_role_dashboard where id = #{id,jdbcType=BIGINT}"
    })
    RelRoleDashboard selectById(Long id);


    @Update({
            "update rel_role_dashboard",
            "set role_id = #{roleId,jdbcType=BIGINT},",
            "dashboard_id = #{dashboardId,jdbcType=BIGINT},",
            "permission = #{permission,jdbcType=SMALLINT},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int updateById(RelRoleDashboard relRoleDashboard);
}