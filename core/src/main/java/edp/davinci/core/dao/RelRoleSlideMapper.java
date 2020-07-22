package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelRoleSlide;
import edp.davinci.core.dao.entity.RelRoleSlideExample;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.DeleteProvider;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.InsertProvider;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.SelectProvider;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.UpdateProvider;
import org.apache.ibatis.type.JdbcType;

@Mapper
public interface RelRoleSlideMapper {
    @SelectProvider(type=RelRoleSlideSqlProvider.class, method="countByExample")
    long countByExample(RelRoleSlideExample example);

    @DeleteProvider(type=RelRoleSlideSqlProvider.class, method="deleteByExample")
    int deleteByExample(RelRoleSlideExample example);

    @Delete({
        "delete from rel_role_slide",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and slide_id = #{slideId,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(@Param("roleId") Long roleId, @Param("slideId") Long slideId);

    @Insert({
        "insert into rel_role_slide (role_id, slide_id, ",
        "visible, create_by, create_time, ",
        "update_by, update_time)",
        "values (#{roleId,jdbcType=BIGINT}, #{slideId,jdbcType=BIGINT}, ",
        "#{visible,jdbcType=BIT}, #{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(RelRoleSlide record);

    @InsertProvider(type=RelRoleSlideSqlProvider.class, method="insertSelective")
    int insertSelective(RelRoleSlide record);

    @SelectProvider(type=RelRoleSlideSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="slide_id", property="slideId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<RelRoleSlide> selectByExample(RelRoleSlideExample example);

    @Select({
        "select",
        "role_id, slide_id, visible, create_by, create_time, update_by, update_time",
        "from rel_role_slide",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and slide_id = #{slideId,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="slide_id", property="slideId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    RelRoleSlide selectByPrimaryKey(@Param("roleId") Long roleId, @Param("slideId") Long slideId);

    @UpdateProvider(type=RelRoleSlideSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") RelRoleSlide record, @Param("example") RelRoleSlideExample example);

    @UpdateProvider(type=RelRoleSlideSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") RelRoleSlide record, @Param("example") RelRoleSlideExample example);

    @UpdateProvider(type=RelRoleSlideSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(RelRoleSlide record);

    @Update({
        "update rel_role_slide",
        "set visible = #{visible,jdbcType=BIT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and slide_id = #{slideId,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(RelRoleSlide record);
}