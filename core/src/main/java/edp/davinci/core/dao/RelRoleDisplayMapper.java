package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelRoleDisplay;
import edp.davinci.core.dao.entity.RelRoleDisplayExample;
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
public interface RelRoleDisplayMapper {
    @SelectProvider(type=RelRoleDisplaySqlProvider.class, method="countByExample")
    long countByExample(RelRoleDisplayExample example);

    @DeleteProvider(type=RelRoleDisplaySqlProvider.class, method="deleteByExample")
    int deleteByExample(RelRoleDisplayExample example);

    @Delete({
        "delete from rel_role_display",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and display_id = #{displayId,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(@Param("roleId") Long roleId, @Param("displayId") Long displayId);

    @Insert({
        "insert into rel_role_display (role_id, display_id, ",
        "visible, create_by, create_time, ",
        "update_by, update_time)",
        "values (#{roleId,jdbcType=BIGINT}, #{displayId,jdbcType=BIGINT}, ",
        "#{visible,jdbcType=BIT}, #{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(RelRoleDisplay record);

    @InsertProvider(type=RelRoleDisplaySqlProvider.class, method="insertSelective")
    int insertSelective(RelRoleDisplay record);

    @SelectProvider(type=RelRoleDisplaySqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="display_id", property="displayId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<RelRoleDisplay> selectByExample(RelRoleDisplayExample example);

    @Select({
        "select",
        "role_id, display_id, visible, create_by, create_time, update_by, update_time",
        "from rel_role_display",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and display_id = #{displayId,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="display_id", property="displayId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    RelRoleDisplay selectByPrimaryKey(@Param("roleId") Long roleId, @Param("displayId") Long displayId);

    @UpdateProvider(type=RelRoleDisplaySqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") RelRoleDisplay record, @Param("example") RelRoleDisplayExample example);

    @UpdateProvider(type=RelRoleDisplaySqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") RelRoleDisplay record, @Param("example") RelRoleDisplayExample example);

    @UpdateProvider(type=RelRoleDisplaySqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(RelRoleDisplay record);

    @Update({
        "update rel_role_display",
        "set visible = #{visible,jdbcType=BIT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and display_id = #{displayId,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(RelRoleDisplay record);
}