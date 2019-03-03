package edp.davinci.dao;

import edp.davinci.model.RelRoleDisplay;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface RelRoleDisplayMapper {
    int insert(RelRoleDisplay record);

    @Delete({
            "delete from rel_role_display where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);


    @Select({
            "select * from rel_role_display where id = #{id,jdbcType=BIGINT}"
    })
    RelRoleDisplay getById(Long id);


    @Update({
            "update rel_role_display",
            "set role_id = #{roleId,jdbcType=BIGINT},",
            "display_id = #{displayId,jdbcType=BIGINT},",
            "permission = #{permission,jdbcType=SMALLINT},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int updateById(RelRoleDisplay record);
}