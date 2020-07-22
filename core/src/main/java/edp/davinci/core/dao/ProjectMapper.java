package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Project;
import edp.davinci.core.dao.entity.ProjectExample;
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
public interface ProjectMapper {
    @SelectProvider(type=ProjectSqlProvider.class, method="countByExample")
    long countByExample(ProjectExample example);

    @DeleteProvider(type=ProjectSqlProvider.class, method="deleteByExample")
    int deleteByExample(ProjectExample example);

    @Delete({
        "delete from project",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into project (id, `name`, ",
        "description, pic, ",
        "org_id, user_id, visibility, ",
        "star_num, is_transfer, ",
        "initial_org_id, create_by, ",
        "create_time, update_by, ",
        "update_time)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{description,jdbcType=VARCHAR}, #{pic,jdbcType=VARCHAR}, ",
        "#{orgId,jdbcType=BIGINT}, #{userId,jdbcType=BIGINT}, #{visibility,jdbcType=BIT}, ",
        "#{starNum,jdbcType=INTEGER}, #{isTransfer,jdbcType=BIT}, ",
        "#{initialOrgId,jdbcType=BIGINT}, #{createBy,jdbcType=BIGINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{updateBy,jdbcType=BIGINT}, ",
        "#{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(Project record);

    @InsertProvider(type=ProjectSqlProvider.class, method="insertSelective")
    int insertSelective(Project record);

    @SelectProvider(type=ProjectSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="pic", property="pic", jdbcType=JdbcType.VARCHAR),
        @Result(column="org_id", property="orgId", jdbcType=JdbcType.BIGINT),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="visibility", property="visibility", jdbcType=JdbcType.BIT),
        @Result(column="star_num", property="starNum", jdbcType=JdbcType.INTEGER),
        @Result(column="is_transfer", property="isTransfer", jdbcType=JdbcType.BIT),
        @Result(column="initial_org_id", property="initialOrgId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<Project> selectByExample(ProjectExample example);

    @Select({
        "select",
        "id, `name`, description, pic, org_id, user_id, visibility, star_num, is_transfer, ",
        "initial_org_id, create_by, create_time, update_by, update_time",
        "from project",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="pic", property="pic", jdbcType=JdbcType.VARCHAR),
        @Result(column="org_id", property="orgId", jdbcType=JdbcType.BIGINT),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="visibility", property="visibility", jdbcType=JdbcType.BIT),
        @Result(column="star_num", property="starNum", jdbcType=JdbcType.INTEGER),
        @Result(column="is_transfer", property="isTransfer", jdbcType=JdbcType.BIT),
        @Result(column="initial_org_id", property="initialOrgId", jdbcType=JdbcType.BIGINT),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    Project selectByPrimaryKey(Long id);

    @UpdateProvider(type=ProjectSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") Project record, @Param("example") ProjectExample example);

    @UpdateProvider(type=ProjectSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") Project record, @Param("example") ProjectExample example);

    @UpdateProvider(type=ProjectSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(Project record);

    @Update({
        "update project",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "pic = #{pic,jdbcType=VARCHAR},",
          "org_id = #{orgId,jdbcType=BIGINT},",
          "user_id = #{userId,jdbcType=BIGINT},",
          "visibility = #{visibility,jdbcType=BIT},",
          "star_num = #{starNum,jdbcType=INTEGER},",
          "is_transfer = #{isTransfer,jdbcType=BIT},",
          "initial_org_id = #{initialOrgId,jdbcType=BIGINT},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(Project record);
}