package edp.davinci.dao;

import edp.davinci.model.ExcludeDisplayTeam;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface ExcludeDisplayTeamMapper {

    int insertBatch(@Param("list") List<ExcludeDisplayTeam> list);

    int deleteByDisplayIdAndTeamIds(@Param("displayId") Long displayId, @Param("teamIds") List<Long> teamIds);

    @Delete({
            "delete from exclude_display_team where display_id = #{displayId}"
    })
    int deleteByDisplayId(@Param("displayId") Long displayId);

    @Select({
            "select team_id from exclude_display_team where display_id = #{id}"
    })
    List<Long> selectExcludeTeamsByDisplayId(@Param("id") Long id);
}