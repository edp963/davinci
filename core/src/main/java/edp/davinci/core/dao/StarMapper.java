package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Star;
import edp.davinci.core.dao.entity.StarExample;
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
public interface StarMapper {
    @SelectProvider(type=StarSqlProvider.class, method="countByExample")
    long countByExample(StarExample example);

    @DeleteProvider(type=StarSqlProvider.class, method="deleteByExample")
    int deleteByExample(StarExample example);

    @Delete({
        "delete from star",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into star (id, target, ",
        "target_id, user_id, ",
        "star_time)",
        "values (#{id,jdbcType=BIGINT}, #{target,jdbcType=VARCHAR}, ",
        "#{targetId,jdbcType=BIGINT}, #{userId,jdbcType=BIGINT}, ",
        "#{starTime,jdbcType=TIMESTAMP})"
    })
    int insert(Star record);

    @InsertProvider(type=StarSqlProvider.class, method="insertSelective")
    int insertSelective(Star record);

    @SelectProvider(type=StarSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="target", property="target", jdbcType=JdbcType.VARCHAR),
        @Result(column="target_id", property="targetId", jdbcType=JdbcType.BIGINT),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="star_time", property="starTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<Star> selectByExample(StarExample example);

    @Select({
        "select",
        "id, target, target_id, user_id, star_time",
        "from star",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="target", property="target", jdbcType=JdbcType.VARCHAR),
        @Result(column="target_id", property="targetId", jdbcType=JdbcType.BIGINT),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="star_time", property="starTime", jdbcType=JdbcType.TIMESTAMP)
    })
    Star selectByPrimaryKey(Long id);

    @UpdateProvider(type=StarSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") Star record, @Param("example") StarExample example);

    @UpdateProvider(type=StarSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") Star record, @Param("example") StarExample example);

    @UpdateProvider(type=StarSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(Star record);

    @Update({
        "update star",
        "set target = #{target,jdbcType=VARCHAR},",
          "target_id = #{targetId,jdbcType=BIGINT},",
          "user_id = #{userId,jdbcType=BIGINT},",
          "star_time = #{starTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(Star record);
}