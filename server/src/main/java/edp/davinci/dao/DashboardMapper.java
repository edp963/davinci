package edp.davinci.dao;

import edp.davinci.dto.dashboardDto.DashboardWithPortal;
import edp.davinci.model.Dashboard;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface DashboardMapper {

    int insert(Dashboard dashboard);

    @Delete({"delete from dashboard where id = #{id}"})
    int deleteById(@Param("id") Long id);

    @Delete({"delete from dashboard where parent_id = #{parentId}"})
    int deleteByParentId(@Param("parentId") Long parentId);

    @Delete({"delete from dashboard where dashboard_portal_id = #{portalId}"})
    int deleteByPortalId(@Param("portalId") Long portalId);


    @Select({"select * from dashboard where id = #{id}"})
    Dashboard getById(@Param("id") Long id);


    @Select({"select id from dashboard where dashboard_portal_id = #{portalId} and name = #{name}"})
    Long getByNameWithPortalId(@Param("name") String name, @Param("portalId") Long portalId);


    @Select({"SELECT IFNULL(MAX(`index`),0) `index` FROM dashboard WHERE dashboard_portal_id = #{portalId}"})
    int getMaxIndexByPortalId(@Param("portalId") Long portalId);


    @Update({
            "update dashboard",
            "set `name` = #{name,jdbcType=VARCHAR},",
            "dashboard_portal_id = #{dashboardPortalId,jdbcType=BIGINT},",
            "`type` = #{type,jdbcType=SMALLINT},",
            "`index` = #{index,jdbcType=INTEGER},",
            "parent_id = #{parentId,jdbcType=BIGINT},",
            "`config` = #{config,jdbcType=LONGVARCHAR}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(Dashboard record);


    int updateBatch(List<Dashboard> list);


    @Select({"select * from dashboard where dashboard_portal_id = #{portalId} order by `index`"})
    List<Dashboard> getByPortalId(@Param("portalId") Long portalId);


    @Select({
            "SELECT ",
            "	d.*,",
            "	dp.id 'portal.id',",
            "	dp.`name` 'portal.name',",
            "	dp.description 'portal.description',",
            "	dp.project_id 'portal.projectId',",
            "	dp.avatar 'portal.avatar',",
            "	dp.publish 'portal.publish',",
            "	p.id 'project.id',",
            "	p.`name` 'project.name',",
            "	p.description 'project.description',",
            "	p.pic 'project.pic',",
            "	p.org_id 'project.orgId',",
            "	p.user_id 'project.userId',",
            "	p.visibility 'p.visibility'",
            "from dashboard d ",
            "LEFT JOIN dashboard_portal dp on dp.id = d.dashboard_portal_id",
            "LEFT JOIN project p on p.id = dp.project_id",
            "WHERE d.id = #{dashboardId}"
    })
    DashboardWithPortal getDashboardWithPortalAndProject(@Param("dashboardId") Long dashboardId);

    @Delete({"delete from dashboard WHERE dashboard_portal_id in (SELECT id FROM dashboard_portal WHERE project_id = #{projectId})"})
    int deleteByProject(@Param("projectId") Long projectId);
}