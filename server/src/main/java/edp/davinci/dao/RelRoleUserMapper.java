package edp.davinci.dao;

import edp.davinci.model.RelRoleUser;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface RelRoleUserMapper {
    int insert(RelRoleUser record);

    @Delete({
            "delete from rel_role_user where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);


    @Select({
            "select",
            "id, user_id, role_id, create_by, create_time, update_by, update_time",
            "from rel_role_user",
            "where id = #{id,jdbcType=BIGINT}"
    })
    @ResultMap("BaseResultMap")
    RelRoleUser selectById(Long id);

    @Update({
            "update rel_role_user",
            "set user_id = #{userId,jdbcType=BIGINT},",
            "role_id = #{roleId,jdbcType=BIGINT},",
            "create_by = #{createBy,jdbcType=BIGINT},",
            "create_time = #{createTime,jdbcType=TIMESTAMP},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int updateById(RelRoleUser record);
}