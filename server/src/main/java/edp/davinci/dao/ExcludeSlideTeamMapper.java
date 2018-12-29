package edp.davinci.dao;

import edp.davinci.model.ExcludeSlideTeam;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface ExcludeSlideTeamMapper {
    int insertBatch(@Param("list") List<ExcludeSlideTeam> list);
}