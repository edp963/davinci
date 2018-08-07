package edp.davinci.dao;

import edp.davinci.dto.projectDto.UserMaxProjectPermission;
import edp.davinci.model.RelTeamProject;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface RelTeamProjectMapper {

    int insert(RelTeamProject relTeamProject);

    @Delete({"delete from rel_team_project where project_id = #{projectId}"})
    void deleteByProjectId(@Param("projectId") Long id);


    @Select({"select * from rel_team_project where team_id = #{teamId}"})
    List<RelTeamProject> getRelsByTeamId(@Param("teamId") Long teamId);


    @Select({"select * from rel_team_project where id = #{id}"})
    RelTeamProject getById(@Param("id") Long id);


    @Update({
            "UPDATE rel_team_project",
            "SET `team_id` = #{teamId},",
            "	`project_id` = #{projectId},",
            "	`source_permission` = #{sourcePermission},",
            "	`view_permission` = #{viewPermission},",
            "	`widget_permission` = #{widgetPermission},",
            "	`viz_permission` = #{vizPermission},",
            "	`schedule_permission` = #{schedulePermission},",
            "	`share_permission` = #{sharePermission},",
            "	`download_permission` = #{downloadPermission} ",
            "WHERE `id` = #{id}",
    })
    int update(RelTeamProject relTeamProject);


    @Delete({"delete from rel_team_project where id = #{id}"})
    int delete(@Param("id") Long id);


    @Select({
            "SELECT ",
            "	IFNULL(max( rtp.viz_permission ),0) ",
            "	FROM rel_team_project rtp",
            "	INNER JOIN rel_user_team rut ON rtp.team_id = rut.team_id ",
            "WHERE rtp.project_id = #{projectId}  AND rut.user_id = #{userId} ",
            "	AND rtp.team_id IN (",
            "		SELECT rut.team_id ",
            "			FROM rel_team_project rtp",
            "			INNER JOIN rel_user_team rut ON rut.team_id = rtp.team_id ",
            "		WHERE rtp.project_id = #{projectId} AND rut.user_id = #{userId} ",
            "	)"
    })
    short getMaxVizPermission(@Param("projectId") Long projectId, @Param("userId") Long userId);

    @Select({
            "SELECT ",
            "	IFNULL(max( rtp.widget_permission ),0) ",
            "	FROM rel_team_project rtp",
            "	INNER JOIN rel_user_team rut ON rtp.team_id = rut.team_id ",
            "WHERE rtp.project_id = #{projectId}  AND rut.user_id = #{userId} ",
            "	AND rtp.team_id IN (",
            "		SELECT rut.team_id ",
            "			FROM rel_team_project rtp",
            "			INNER JOIN rel_user_team rut ON rut.team_id = rtp.team_id ",
            "		WHERE rtp.project_id = #{projectId} AND rut.user_id = #{userId} ",
            "	)"
    })
    short getMaxWidgetPermission(@Param("projectId") Long projectId, @Param("userId") Long userId);

    @Select({
            "SELECT ",
            "	IFNULL(max( rtp.view_permission ),0) ",
            "	FROM rel_team_project rtp",
            "	INNER JOIN rel_user_team rut ON rtp.team_id = rut.team_id ",
            "WHERE rtp.project_id = #{projectId}  AND rut.user_id = #{userId} ",
            "	AND rtp.team_id IN (",
            "		SELECT rut.team_id ",
            "			FROM rel_team_project rtp",
            "			INNER JOIN rel_user_team rut ON rut.team_id = rtp.team_id ",
            "		WHERE rtp.project_id = #{projectId} AND rut.user_id = #{userId} ",
            "	)"
    })
    short getMaxViewPermission(@Param("projectId") Long projectId, @Param("userId") Long userId);


    @Select({
            "SELECT ",
            "	IFNULL(max( rtp.source_permission ),0) ",
            "	FROM rel_team_project rtp",
            "	INNER JOIN rel_user_team rut ON rtp.team_id = rut.team_id ",
            "WHERE rtp.project_id = #{projectId}  AND rut.user_id = #{userId} ",
            "	AND rtp.team_id IN (",
            "		SELECT rut.team_id ",
            "			FROM rel_team_project rtp",
            "			INNER JOIN rel_user_team rut ON rut.team_id = rtp.team_id ",
            "		WHERE rtp.project_id = #{projectId} AND rut.user_id = #{userId} ",
            "	)"
    })
    short getMaxSourcePermission(@Param("projectId") Long projectId, @Param("userId") Long userId);


    @Select({
            "SELECT ",
            "	IFNULL(max( rtp.schedule_permission ),0) ",
            "	FROM rel_team_project rtp",
            "	INNER JOIN rel_user_team rut ON rtp.team_id = rut.team_id ",
            "WHERE rtp.project_id = #{projectId}  AND rut.user_id = #{userId} ",
            "	AND rtp.team_id IN (",
            "		SELECT rut.team_id ",
            "			FROM rel_team_project rtp",
            "			INNER JOIN rel_user_team rut ON rut.team_id = rtp.team_id ",
            "		WHERE rtp.project_id = #{projectId} AND rut.user_id = #{userId} ",
            "	)"
    })
    short getMaxSchedulePermission(@Param("projectId") Long projectId, @Param("userId") Long userId);


    @Select({
            "SELECT ",
            "	IFNULL(max( rtp.share_permission ),0) ",
            "	FROM rel_team_project rtp",
            "	INNER JOIN rel_user_team rut ON rtp.team_id = rut.team_id ",
            "WHERE rtp.project_id = #{projectId}  AND rut.user_id = #{userId} ",
            "	AND rtp.team_id IN (",
            "		SELECT rut.team_id ",
            "			FROM rel_team_project rtp",
            "			INNER JOIN rel_user_team rut ON rut.team_id = rtp.team_id ",
            "		WHERE rtp.project_id = #{projectId} AND rut.user_id = #{userId} ",
            "	)"
    })
    Boolean getMaxSharePermission(@Param("projectId") Long projectId, @Param("userId") Long userId);


    @Select({
            "SELECT ",
            "	IFNULL(max( rtp.download_permission ),0) ",
            "	FROM rel_team_project rtp",
            "	INNER JOIN rel_user_team rut ON rtp.team_id = rut.team_id ",
            "WHERE rtp.project_id = #{projectId}  AND rut.user_id = #{userId} ",
            "	AND rtp.team_id IN (",
            "		SELECT rut.team_id ",
            "			FROM rel_team_project rtp",
            "			INNER JOIN rel_user_team rut ON rut.team_id = rtp.team_id ",
            "		WHERE rtp.project_id = #{projectId} AND rut.user_id = #{userId} ",
            "	)"
    })
    Boolean getMaxDownloadPermission(@Param("projectId") Long projectId, @Param("userId") Long userId);


    @Select({
            "SELECT ",
            "	IFNULL(rtp.project_id,0) as projectId,",
            "	IFNULL(max( rtp.viz_permission ),0) as vizPermission,",
            "	IFNULL(max( rtp.widget_permission ),0) as widgetPermission,",
            "	IFNULL(max( rtp.view_permission ),0) as viewPermission,",
            "	IFNULL(max( rtp.source_permission ),0) as sourcePermission,",
            "	IFNULL(max( rtp.schedule_permission ),0) as schedulePermission,",
            "	IFNULL(max( rtp.share_permission ),0) as sharePermission,",
            "	IFNULL(max( rtp.download_permission ),0) as downloadPermission",
            "	FROM rel_team_project rtp",
            "	INNER JOIN rel_user_team rut ON rtp.team_id = rut.team_id ",
            "WHERE rut.user_id = #{userId} AND rtp.team_id IN (",
            "		SELECT rut.team_id  FROM rel_team_project rtp",
            "			INNER JOIN rel_user_team rut ON rut.team_id = rtp.team_id ",
            "			WHERE rut.user_id = #{userId})",
            "GROUP BY project_id"
    })
    List<UserMaxProjectPermission> getUserMaxPermission(@Param("userId") Long userId);

}