package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.RelRoleView;
import edp.davinci.core.dao.entity.RelRoleViewExample;
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
public interface RelRoleViewMapper {
    @SelectProvider(type=RelRoleViewSqlProvider.class, method="countByExample")
    long countByExample(RelRoleViewExample example);

    @DeleteProvider(type=RelRoleViewSqlProvider.class, method="deleteByExample")
    int deleteByExample(RelRoleViewExample example);

    @Delete({
        "delete from rel_role_view",
        "where view_id = #{viewId,jdbcType=BIGINT}",
          "and role_id = #{roleId,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(@Param("viewId") Long viewId, @Param("roleId") Long roleId);

    @Insert({
        "insert into rel_role_view (view_id, role_id, ",
        "create_by, create_time, ",
        "update_by, update_time, ",
        "row_auth, column_auth)",
        "values (#{viewId,jdbcType=BIGINT}, #{roleId,jdbcType=BIGINT}, ",
        "#{createBy,jdbcType=BIGINT}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP}, ",
        "#{rowAuth,jdbcType=LONGVARCHAR}, #{columnAuth,jdbcType=LONGVARCHAR})"
    })
    int insert(RelRoleView record);

    @InsertProvider(type=RelRoleViewSqlProvider.class, method="insertSelective")
    int insertSelective(RelRoleView record);

    @SelectProvider(type=RelRoleViewSqlProvider.class, method="selectByExampleWithBLOBs")
    @Results({
        @Result(column="view_id", property="viewId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="row_auth", property="rowAuth", jdbcType=JdbcType.LONGVARCHAR),
        @Result(column="column_auth", property="columnAuth", jdbcType=JdbcType.LONGVARCHAR)
    })
    List<RelRoleView> selectByExampleWithBLOBs(RelRoleViewExample example);

    @SelectProvider(type=RelRoleViewSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="view_id", property="viewId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<RelRoleView> selectByExample(RelRoleViewExample example);

    @Select({
        "select",
        "view_id, role_id, create_by, create_time, update_by, update_time, row_auth, ",
        "column_auth",
        "from rel_role_view",
        "where view_id = #{viewId,jdbcType=BIGINT}",
          "and role_id = #{roleId,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="view_id", property="viewId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="role_id", property="roleId", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="row_auth", property="rowAuth", jdbcType=JdbcType.LONGVARCHAR),
        @Result(column="column_auth", property="columnAuth", jdbcType=JdbcType.LONGVARCHAR)
    })
    RelRoleView selectByPrimaryKey(@Param("viewId") Long viewId, @Param("roleId") Long roleId);

    @UpdateProvider(type=RelRoleViewSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") RelRoleView record, @Param("example") RelRoleViewExample example);

    @UpdateProvider(type=RelRoleViewSqlProvider.class, method="updateByExampleWithBLOBs")
    int updateByExampleWithBLOBs(@Param("record") RelRoleView record, @Param("example") RelRoleViewExample example);

    @UpdateProvider(type=RelRoleViewSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") RelRoleView record, @Param("example") RelRoleViewExample example);

    @UpdateProvider(type=RelRoleViewSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(RelRoleView record);

    @Update({
        "update rel_role_view",
        "set create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP},",
          "row_auth = #{rowAuth,jdbcType=LONGVARCHAR},",
          "column_auth = #{columnAuth,jdbcType=LONGVARCHAR}",
        "where view_id = #{viewId,jdbcType=BIGINT}",
          "and role_id = #{roleId,jdbcType=BIGINT}"
    })
    int updateByPrimaryKeyWithBLOBs(RelRoleView record);

    @Update({
        "update rel_role_view",
        "set create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where view_id = #{viewId,jdbcType=BIGINT}",
          "and role_id = #{roleId,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(RelRoleView record);
}