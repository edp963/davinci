package edp.davinci.dao;

import edp.davinci.model.RelRoleSlide;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface RelRoleSlideMapper {

    int insert(RelRoleSlide relRoleSlide);

    @Delete({
            "delete from rel_role_slide where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);

    @Select({
            "select * from rel_role_slide where id = #{id,jdbcType=BIGINT}"
    })
    RelRoleSlide getById(Long id);


    @Update({
            "update rel_role_slide",
            "set role_id = #{roleId,jdbcType=BIGINT},",
            "slide_id = #{slideId,jdbcType=BIGINT},",
            "permission = #{permission,jdbcType=SMALLINT},",
            "update_by = #{updateBy,jdbcType=BIGINT},",
            "update_time = #{updateTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int updateById(RelRoleSlide record);
}