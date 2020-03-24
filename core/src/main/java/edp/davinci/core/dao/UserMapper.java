package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.User;
import edp.davinci.core.dao.entity.UserExample;
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
public interface UserMapper {
    @SelectProvider(type=UserSqlProvider.class, method="countByExample")
    long countByExample(UserExample example);

    @DeleteProvider(type=UserSqlProvider.class, method="deleteByExample")
    int deleteByExample(UserExample example);

    @Delete({
        "delete from user",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into user (id, email, ",
        "username, `password`, ",
        "`admin`, active, `name`, ",
        "description, department, ",
        "avatar, create_time, ",
        "create_by, update_time, ",
        "update_by)",
        "values (#{id,jdbcType=BIGINT}, #{email,jdbcType=VARCHAR}, ",
        "#{username,jdbcType=VARCHAR}, #{password,jdbcType=VARCHAR}, ",
        "#{admin,jdbcType=BIT}, #{active,jdbcType=BIT}, #{name,jdbcType=VARCHAR}, ",
        "#{description,jdbcType=VARCHAR}, #{department,jdbcType=VARCHAR}, ",
        "#{avatar,jdbcType=VARCHAR}, #{createTime,jdbcType=TIMESTAMP}, ",
        "#{createBy,jdbcType=BIGINT}, #{updateTime,jdbcType=TIMESTAMP}, ",
        "#{updateBy,jdbcType=BIGINT})"
    })
    int insert(User record);

    @InsertProvider(type=UserSqlProvider.class, method="insertSelective")
    int insertSelective(User record);

    @SelectProvider(type=UserSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="email", property="email", jdbcType=JdbcType.VARCHAR),
        @Result(column="username", property="username", jdbcType=JdbcType.VARCHAR),
        @Result(column="password", property="password", jdbcType=JdbcType.VARCHAR),
        @Result(column="admin", property="admin", jdbcType=JdbcType.BIT),
        @Result(column="active", property="active", jdbcType=JdbcType.BIT),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="department", property="department", jdbcType=JdbcType.VARCHAR),
        @Result(column="avatar", property="avatar", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT)
    })
    List<User> selectByExample(UserExample example);

    @Select({
        "select",
        "id, email, username, `password`, `admin`, active, `name`, description, department, ",
        "avatar, create_time, create_by, update_time, update_by",
        "from user",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="email", property="email", jdbcType=JdbcType.VARCHAR),
        @Result(column="username", property="username", jdbcType=JdbcType.VARCHAR),
        @Result(column="password", property="password", jdbcType=JdbcType.VARCHAR),
        @Result(column="admin", property="admin", jdbcType=JdbcType.BIT),
        @Result(column="active", property="active", jdbcType=JdbcType.BIT),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="description", property="description", jdbcType=JdbcType.VARCHAR),
        @Result(column="department", property="department", jdbcType=JdbcType.VARCHAR),
        @Result(column="avatar", property="avatar", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT)
    })
    User selectByPrimaryKey(Long id);

    @UpdateProvider(type=UserSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") User record, @Param("example") UserExample example);

    @UpdateProvider(type=UserSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") User record, @Param("example") UserExample example);

    @UpdateProvider(type=UserSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(User record);

    @Update({
        "update user",
        "set email = #{email,jdbcType=VARCHAR},",
          "username = #{username,jdbcType=VARCHAR},",
          "`password` = #{password,jdbcType=VARCHAR},",
          "`admin` = #{admin,jdbcType=BIT},",
          "active = #{active,jdbcType=BIT},",
          "`name` = #{name,jdbcType=VARCHAR},",
          "description = #{description,jdbcType=VARCHAR},",
          "department = #{department,jdbcType=VARCHAR},",
          "avatar = #{avatar,jdbcType=VARCHAR},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(User record);
}