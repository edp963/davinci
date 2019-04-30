package edp.davinci.dao;

import edp.davinci.model.RelRoleDashboard;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Set;

public interface RelRoleDashboardMapper {

    int insert(RelRoleDashboard relRoleDashboard);

    int insertBatch(List<RelRoleDashboard> list);

    @Select({
            "select rrd.dashboard_id",
            "from rel_role_dashboard rrd",
            "   inner join rel_role_user rru on rru.role_id = rrd.role_id",
            "   inner join dashboard d on d.id  = rrd.dashboard_id",
            "where rru.user_id = #{userId} and rrd.visible = 0 and d.dashboard_portal_id = #{portalId}"
    })
    List<Long> getDisableByUser(@Param("userId") Long userId, @Param("portalId") Long portalId);


    @Select("select role_id from rel_role_dashboard where dashboard_id = #{id}")
    List<Long> getExecludeRoels(@Param("id") Long id);

    int deleteByDashboardIds(@Param("dashboardIds") Set<Long> dashboardIds);

    @Select({
            "select count(1)",
            "from rel_role_dashboard rrd inner join rel_role_user rru on rru.role_id = rrd.role_id",
            "where rru.user_id = #{userId} and rrd.dashboard_id = #{id} and rrd.visible = 0"
    })
    boolean isDisable(@Param("id") Long id, @Param("userId") Long userId);

    @Delete({
            "delete from rel_role_dashboard where dashboard_id in (select id from dashboard where id = #{id} or find_in_set(#{id}, full_parent_Id) > 0)"
    })
    int deleteByDashboardId(Long id);
}