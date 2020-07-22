package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelRolePortal;
import edp.davinci.core.dao.entity.RelRolePortalExample;
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
public interface RelRolePortalMapper {
    @SelectProvider(type=RelRolePortalSqlProvider.class, method="countByExample")
    long countByExample(RelRolePortalExample example);

    @DeleteProvider(type=RelRolePortalSqlProvider.class, method="deleteByExample")
    int deleteByExample(RelRolePortalExample example);

    @Delete({
        "delete from rel_role_portal",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and portal_id = #{portalId,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(@Param("roleId") Long roleId, @Param("portalId") Long portalId);

    @Insert({
        "insert into rel_role_portal (role_id, portal_id, ",
        "visible, create_by, create_time, ",
        "update_by, update_time)",
        "values (#{roleId,jdbcType=BIGINT}, #{portalId,jdbcType=BIGINT}, ",
        "#{visible,jdbcType=BIT}, #{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(RelRolePortal record);

    @InsertProvider(type=RelRolePortalSqlProvider.class, method="insertSelective")
    int insertSelective(RelRolePortal record);

    @SelectProvider(type=RelRolePortalSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="portal_id", property="portalId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<RelRolePortal> selectByExample(RelRolePortalExample example);

    @Select({
        "select",
        "role_id, portal_id, visible, create_by, create_time, update_by, update_time",
        "from rel_role_portal",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and portal_id = #{portalId,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="portal_id", property="portalId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="visible", property="visible", jdbcType=JdbcType.BIT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    RelRolePortal selectByPrimaryKey(@Param("roleId") Long roleId, @Param("portalId") Long portalId);

    @UpdateProvider(type=RelRolePortalSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") RelRolePortal record, @Param("example") RelRolePortalExample example);

    @UpdateProvider(type=RelRolePortalSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") RelRolePortal record, @Param("example") RelRolePortalExample example);

    @UpdateProvider(type=RelRolePortalSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(RelRolePortal record);

    @Update({
        "update rel_role_portal",
        "set visible = #{visible,jdbcType=BIT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where role_id = #{roleId,jdbcType=BIGINT}",
          "and portal_id = #{portalId,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(RelRolePortal record);
}