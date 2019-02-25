package edp.davinci.dao;

import edp.davinci.model.Role;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface RoleMapper {
    int insert(Role record);

    @Delete({
            "delete from role where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);

    @Select({
            "select * from role where id = #{id,jdbcType=BIGINT}"
    })
    @ResultMap("BaseResultMap")
    Role selectById(Long id);

    @Update({
            "update role",
            "set org_id = #{orgId,jdbcType=BIGINT},",
            "name = #{name,jdbcType=VARCHAR},",
            "description = #{description,jdbcType=VARCHAR},",
            "create_by = #{createBy,jdbcType=BIGINT},",
            "create_time = #{createTime,jdbcType=TIMESTAMP},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(Role record);
}