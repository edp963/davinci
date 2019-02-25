package edp.davinci.dao;

import edp.davinci.model.RelRolePortal;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface RelRolePortalMapper {

    int insert(RelRolePortal record);

    @Delete({
            "delete from rel_role_portal",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);


    @Select({
            "select * from rel_role_portal where id = #{id,jdbcType=BIGINT}"
    })
    RelRolePortal selectById(Long id);


    @Update({
            "update rel_role_portal",
            "set role_id = #{roleId,jdbcType=BIGINT},",
            "portal_id = #{portalId,jdbcType=BIGINT},",
            "permission = #{permission,jdbcType=SMALLINT},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int updateById(RelRolePortal record);
}