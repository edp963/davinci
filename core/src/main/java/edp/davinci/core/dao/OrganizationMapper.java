package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Organization;
import edp.davinci.core.dao.entity.OrganizationExample;
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
public interface OrganizationMapper {
    @SelectProvider(type=OrganizationSqlProvider.class, method="countByExample")
    long countByExample(OrganizationExample example);

    @DeleteProvider(type=OrganizationSqlProvider.class, method="deleteByExample")
    int deleteByExample(OrganizationExample example);

    @Delete({
        "delete from organization",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into organization (id, `name`, ",
        "description, avatar, ",
        "user_id, project_num, ",
        "member_num, role_num, ",
        "allow_create_project, member_permission, ",
        "create_time, create_by, ",
        "update_time, update_by)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{description,jdbcType=VARCHAR}, #{avatar,jdbcType=VARCHAR}, ",
        "#{userId,jdbcType=BIGINT}, #{projectNum,jdbcType=INTEGER}, ",
        "#{memberNum,jdbcType=INTEGER}, #{roleNum,jdbcType=INTEGER}, ",
        "#{allowCreateProject,jdbcType=BIT}, #{memberPermission,jdbcType=SMALLINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{createBy,jdbcType=BIGINT}, ",
        "#{updateTime,jdbcType=TIMESTAMP}, #{updateBy,jdbcType=BIGINT})"
    })
    int insert(Organization record);

    @InsertProvider(type=OrganizationSqlProvider.class, method="insertSelective")
    int insertSelective(Organization record);

    @SelectProvider(type=OrganizationSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="avatar", property="avatar", jdbcType=JdbcType.VARCHAR),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_num", property="projectNum", jdbcType=JdbcType.INTEGER),
        @Result(column="member_num", property="memberNum", jdbcType=JdbcType.INTEGER),
        @Result(column="role_num", property="roleNum", jdbcType=JdbcType.INTEGER),
        @Result(column="allow_create_project", property="allowCreateProject", jdbcType=JdbcType.BIT),
        @Result(column="member_permission", property="memberPermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT)
    })
    List<Organization> selectByExample(OrganizationExample example);

    @Select({
        "select",
        "id, `name`, description, avatar, user_id, project_num, member_num, role_num, ",
        "allow_create_project, member_permission, create_time, create_by, update_time, ",
        "update_by",
        "from organization",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="avatar", property="avatar", jdbcType=JdbcType.VARCHAR),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="project_num", property="projectNum", jdbcType=JdbcType.INTEGER),
        @Result(column="member_num", property="memberNum", jdbcType=JdbcType.INTEGER),
        @Result(column="role_num", property="roleNum", jdbcType=JdbcType.INTEGER),
        @Result(column="allow_create_project", property="allowCreateProject", jdbcType=JdbcType.BIT),
        @Result(column="member_permission", property="memberPermission", jdbcType=JdbcType.SMALLINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT)
    })
    Organization selectByPrimaryKey(Long id);

    @UpdateProvider(type=OrganizationSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") Organization record, @Param("example") OrganizationExample example);

    @UpdateProvider(type=OrganizationSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") Organization record, @Param("example") OrganizationExample example);

    @UpdateProvider(type=OrganizationSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(Organization record);

    @Update({
        "update organization",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "avatar = #{avatar,jdbcType=VARCHAR},",
          "user_id = #{userId,jdbcType=BIGINT},",
          "project_num = #{projectNum,jdbcType=INTEGER},",
          "member_num = #{memberNum,jdbcType=INTEGER},",
          "role_num = #{roleNum,jdbcType=INTEGER},",
          "allow_create_project = #{allowCreateProject,jdbcType=BIT},",
          "member_permission = #{memberPermission,jdbcType=SMALLINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(Organization record);
}