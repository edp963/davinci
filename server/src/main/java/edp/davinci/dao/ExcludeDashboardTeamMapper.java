package edp.davinci.dao;

import edp.davinci.model.ExcludeDashboardTeam;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface ExcludeDashboardTeamMapper {

    int insertBatch(@Param("list") List<ExcludeDashboardTeam> list);

    int deleteByDashboardIdAndTeamIds(@Param("dashboardId") Long dashboardId, @Param("teamIds") List<Long> list);

    @Delete({
            "delete from exclude_dashboard_team where dashboard_id = #{dashboardId}"
    })
    int deleteByDashboardId(@Param("dashboardId") Long dashboardId);

    @Select({
            "select team_id from exclude_dashboard_team where dashboard_id = #{id}"
    })
    List<Long> selectExcludeTeamsByDashboardId(@Param("id") Long id);

    List<ExcludeDashboardTeam> selectExcludesByDashboardIds(@Param("list") List<Long> dashboardIds);
}