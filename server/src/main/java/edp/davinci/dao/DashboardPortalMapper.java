package edp.davinci.dao;

import edp.davinci.dto.dashboardDto.PortalWithProject;
import edp.davinci.model.DashboardPortal;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface DashboardPortalMapper {
    int insert(DashboardPortal dashboardPortal);

    @Delete({"delete from dashboard_portal where id = #{id}"})
    int deleteById(@Param("id") Long id);


    @Select({"select * from dashboard_portal where id = #{id}"})
    DashboardPortal getById(@Param("id") Long id);


    @Update({
            "update dashboard_portal",
            "set `name` = #{name,jdbcType=VARCHAR},",
            "description = #{description,jdbcType=VARCHAR},",
            "project_id = #{projectId,jdbcType=BIGINT},",
            "avatar = #{avatar,jdbcType=VARCHAR},",
            "publish = #{publish,jdbcType=BIT}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(DashboardPortal dashboardPortal);

    @Select({"select id from dashboard_portal where project_id = #{projectId} and name = #{name}"})
    Long getByNameWithProjectId(@Param("name") String name, @Param("projectId") Long projectId);

    @Select({"select * from dashboard_portal where project_id = #{projectId}"})
    List<DashboardPortal> getByProject(@Param("projectId") Long projectId);


    @Select({
            "SELECT ",
            "	dp.*,",
            "	p.id 'project.id',",
            "	p.`name` 'project.name',",
            "	p.description 'project.description',",
            "	p.pic 'project.pic',",
            "	p.org_id 'project.orgId',",
            "	p.user_id 'project.userId',",
            "	p.visibility 'p.visibility'",
            "FROM",
            "	dashboard_portal dp ",
            "	LEFT JOIN project p on p.id = dp.project_id",
            "WHERE dp.id = #{id}",
    })
    PortalWithProject getPortalWithProjectById(@Param("id") Long id);

    @Delete({"delete from dashboard_portal where project_id = #{projectId}"})
    int deleteByProject(@Param("projectId") Long projectId);
}