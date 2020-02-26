package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.DavinciStatisticDuration;
import edp.davinci.core.dao.entity.DavinciStatisticDurationExample;
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
public interface DavinciStatisticDurationMapper {
    @SelectProvider(type=DavinciStatisticDurationSqlProvider.class, method="countByExample")
    long countByExample(DavinciStatisticDurationExample example);

    @DeleteProvider(type=DavinciStatisticDurationSqlProvider.class, method="deleteByExample")
    int deleteByExample(DavinciStatisticDurationExample example);

    @Delete({
        "delete from davinci_statistic_duration",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into davinci_statistic_duration (id, user_id, ",
        "email, start_time, ",
        "end_time)",
        "values (#{id,jdbcType=BIGINT}, #{userId,jdbcType=BIGINT}, ",
        "#{email,jdbcType=VARCHAR}, #{startTime,jdbcType=TIMESTAMP}, ",
        "#{endTime,jdbcType=TIMESTAMP})"
    })
    int insert(DavinciStatisticDuration record);

    @InsertProvider(type=DavinciStatisticDurationSqlProvider.class, method="insertSelective")
    int insertSelective(DavinciStatisticDuration record);

    @SelectProvider(type=DavinciStatisticDurationSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="email", property="email", jdbcType=JdbcType.VARCHAR),
        @Result(column="start_time", property="startTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="end_time", property="endTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<DavinciStatisticDuration> selectByExample(DavinciStatisticDurationExample example);

    @Select({
        "select",
        "id, user_id, email, start_time, end_time",
        "from davinci_statistic_duration",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="email", property="email", jdbcType=JdbcType.VARCHAR),
        @Result(column="start_time", property="startTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="end_time", property="endTime", jdbcType=JdbcType.TIMESTAMP)
    })
    DavinciStatisticDuration selectByPrimaryKey(Long id);

    @UpdateProvider(type=DavinciStatisticDurationSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") DavinciStatisticDuration record, @Param("example") DavinciStatisticDurationExample example);

    @UpdateProvider(type=DavinciStatisticDurationSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") DavinciStatisticDuration record, @Param("example") DavinciStatisticDurationExample example);

    @UpdateProvider(type=DavinciStatisticDurationSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(DavinciStatisticDuration record);

    @Update({
        "update davinci_statistic_duration",
        "set user_id = #{userId,jdbcType=BIGINT},",
          "email = #{email,jdbcType=VARCHAR},",
          "start_time = #{startTime,jdbcType=TIMESTAMP},",
          "end_time = #{endTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(DavinciStatisticDuration record);
}