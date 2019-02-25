package edp.davinci.dao;

import edp.davinci.model.RelProjectAdmin;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;

public interface RelProjectAdminMapper {

    int insert(RelProjectAdmin relProjectAdmin);

    @Delete({
            "delete from rel_project_admin where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);

    @Delete({
            "delete from rel_project_admin where project_id = #{projectId} and user_id = #{userId}"
    })
    int delete(@Param("projectId") Long projectId, @Param("userId") Long userId);
}