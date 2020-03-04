package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.DisplaySlide;
import edp.davinci.core.dao.entity.DisplaySlideExample;
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
public interface DisplaySlideMapper {
    @SelectProvider(type=DisplaySlideSqlProvider.class, method="countByExample")
    long countByExample(DisplaySlideExample example);

    @DeleteProvider(type=DisplaySlideSqlProvider.class, method="deleteByExample")
    int deleteByExample(DisplaySlideExample example);

    @Delete({
        "delete from display_slide",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into display_slide (id, display_id, ",
        "`index`, config, create_by, ",
        "create_time, update_by, ",
        "update_time)",
        "values (#{id,jdbcType=BIGINT}, #{displayId,jdbcType=BIGINT}, ",
        "#{index,jdbcType=INTEGER}, #{config,jdbcType=VARCHAR}, #{createBy,jdbcType=BIGINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{updateBy,jdbcType=BIGINT}, ",
        "#{updateTime,jdbcType=TIMESTAMP})"
    })
    int insert(DisplaySlide record);

    @InsertProvider(type=DisplaySlideSqlProvider.class, method="insertSelective")
    int insertSelective(DisplaySlide record);

    @SelectProvider(type=DisplaySlideSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="display_id", property="displayId", jdbcType=JdbcType.BIGINT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<DisplaySlide> selectByExample(DisplaySlideExample example);

    @Select({
        "select",
        "id, display_id, `index`, config, create_by, create_time, update_by, update_time",
        "from display_slide",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="display_id", property="displayId", jdbcType=JdbcType.BIGINT),
        @Result(column="index", property="index", jdbcType=JdbcType.INTEGER),
        @Result(column="config", property="config", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_by", property="createBy", jdbcType=JdbcType.BIGINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="update_by", property="updateBy", jdbcType=JdbcType.BIGINT),
        @Result(column="update_time", property="updateTime", jdbcType=JdbcType.TIMESTAMP)
    })
    DisplaySlide selectByPrimaryKey(Long id);

    @UpdateProvider(type=DisplaySlideSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") DisplaySlide record, @Param("example") DisplaySlideExample example);

    @UpdateProvider(type=DisplaySlideSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") DisplaySlide record, @Param("example") DisplaySlideExample example);

    @UpdateProvider(type=DisplaySlideSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(DisplaySlide record);

    @Update({
        "update display_slide",
        "set display_id = #{displayId,jdbcType=BIGINT},",
          "`index` = #{index,jdbcType=INTEGER},",
          "config = #{config,jdbcType=VARCHAR},",
          "create_by = #{createBy,jdbcType=BIGINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "update_by = #{updateBy,jdbcType=BIGINT},",
          "update_time = #{updateTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(DisplaySlide record);
}