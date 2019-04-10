package edp.davinci.dao;

import edp.davinci.model.ExcludePortalTeam;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface ExcludePortalTeamMapper {

    int insertBatch(@Param("list") List<ExcludePortalTeam> list);


    int deleteByPortalIdAndTeamIds(@Param("portalId") Long portalId, @Param("teamIds") List<Long> teamIds);

    @Delete({
            "delete from exclude_portal_team where portal_id = #{portalId}"
    })
    int deleteByPortalId(@Param("portalId") Long portalId);

    @Select({
            "select team_id from exclude_portal_team where portal_id = #{id}"
    })
    List<Long> selectExcludeTeamsByPortalId(@Param("id") Long id);
}