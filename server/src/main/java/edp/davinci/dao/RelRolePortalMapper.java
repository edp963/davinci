package edp.davinci.dao;

import edp.davinci.model.RelRolePortal;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface RelRolePortalMapper {

    int insert(RelRolePortal record);


    int insertBatch(@Param("list") List<RelRolePortal> relRolePortals);

    @Select({
            "select rrp.portal_id",
            "from rel_role_portal rrp",
            "       inner join rel_role_user rru on rru.role_id = rrp.role_id",
            "       inner join dashboard_portal p on p.id = rrp.portal_id",
            "where rru.user_id = #{userId} and rrp.visible = 0 and p.project_id = #{projectId}",
    })
    List<Long> getDisablePortalByUser(@Param("userId") Long userId, @Param("projectId") Long projectId);

    @Delete({"delete from rel_role_portal where portal_id = #{portalId}"})
    int deleteByProtalId(@Param("portalId") Long portalId);

    @Select("select role_id from rel_role_portal where portal_id = #{portalId} and visible = 0")
    List<Long> getExecludeRoles(@Param("portalId") Long portalId);

    @Select({"select count(1)",
            "from rel_role_portal rrp inner join rel_role_user rru on rru.role_id = rrp.role_id",
            "where rru.user_id = #{userId} and rrp.portal_id = #{id} and rrp.visible = 0"
    })
    boolean isDisable(@Param("id") Long id, @Param("userId") Long userId);

    @Select({
            "select rrp.portal_id",
            "from rel_role_portal rrp",
            "inner join dashboard_portal p on p.id = rrp.portal_id",
            "where rrp.role_id = #{id} and rrp.visible = 0 and p.project_id = #{projectId}"
    })
    List<Long> getExecludePortals(@Param("id") Long id, @Param("projectId") Long projectId);

    @Delete({"delete from rel_role_portal where portal_id = #{portalId} and role_id = #{roleId}"})
    int delete(@Param("portalId") Long portalId, @Param("roleId") Long roleId);

    @Delete({"delete from rel_role_portal where role_id = #{roleId}"})
    int deleteByRoleId(Long roleId);
}