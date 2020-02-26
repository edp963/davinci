package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.Platform;
import edp.davinci.core.dao.entity.PlatformExample;
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
public interface PlatformMapper {
    @SelectProvider(type=PlatformSqlProvider.class, method="countByExample")
    long countByExample(PlatformExample example);

    @DeleteProvider(type=PlatformSqlProvider.class, method="deleteByExample")
    int deleteByExample(PlatformExample example);

    @Delete({
        "delete from platform",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into platform (id, `name`, ",
        "platform, code, ",
        "checkCode, checkSystemToken, ",
        "checkUrl, alternateField1, ",
        "alternateField2, alternateField3, ",
        "alternateField4, alternateField5)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{platform,jdbcType=VARCHAR}, #{code,jdbcType=VARCHAR}, ",
        "#{checkcode,jdbcType=VARCHAR}, #{checksystemtoken,jdbcType=VARCHAR}, ",
        "#{checkurl,jdbcType=VARCHAR}, #{alternatefield1,jdbcType=VARCHAR}, ",
        "#{alternatefield2,jdbcType=VARCHAR}, #{alternatefield3,jdbcType=VARCHAR}, ",
        "#{alternatefield4,jdbcType=VARCHAR}, #{alternatefield5,jdbcType=VARCHAR})"
    })
    int insert(Platform record);

    @InsertProvider(type=PlatformSqlProvider.class, method="insertSelective")
    int insertSelective(Platform record);

    @SelectProvider(type=PlatformSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="platform", property="platform", jdbcType=JdbcType.VARCHAR),
        @Result(column="code", property="code", jdbcType=JdbcType.VARCHAR),
        @Result(column="checkCode", property="checkcode", jdbcType=JdbcType.VARCHAR),
        @Result(column="checkSystemToken", property="checksystemtoken", jdbcType=JdbcType.VARCHAR),
        @Result(column="checkUrl", property="checkurl", jdbcType=JdbcType.VARCHAR),
        @Result(column="alternateField1", property="alternatefield1", jdbcType=JdbcType.VARCHAR),
        @Result(column="alternateField2", property="alternatefield2", jdbcType=JdbcType.VARCHAR),
        @Result(column="alternateField3", property="alternatefield3", jdbcType=JdbcType.VARCHAR),
        @Result(column="alternateField4", property="alternatefield4", jdbcType=JdbcType.VARCHAR),
        @Result(column="alternateField5", property="alternatefield5", jdbcType=JdbcType.VARCHAR)
    })
    List<Platform> selectByExample(PlatformExample example);

    @Select({
        "select",
        "id, `name`, platform, code, checkCode, checkSystemToken, checkUrl, alternateField1, ",
        "alternateField2, alternateField3, alternateField4, alternateField5",
        "from platform",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="platform", property="platform", jdbcType=JdbcType.VARCHAR),
        @Result(column="code", property="code", jdbcType=JdbcType.VARCHAR),
        @Result(column="checkCode", property="checkcode", jdbcType=JdbcType.VARCHAR),
        @Result(column="checkSystemToken", property="checksystemtoken", jdbcType=JdbcType.VARCHAR),
        @Result(column="checkUrl", property="checkurl", jdbcType=JdbcType.VARCHAR),
        @Result(column="alternateField1", property="alternatefield1", jdbcType=JdbcType.VARCHAR),
        @Result(column="alternateField2", property="alternatefield2", jdbcType=JdbcType.VARCHAR),
        @Result(column="alternateField3", property="alternatefield3", jdbcType=JdbcType.VARCHAR),
        @Result(column="alternateField4", property="alternatefield4", jdbcType=JdbcType.VARCHAR),
        @Result(column="alternateField5", property="alternatefield5", jdbcType=JdbcType.VARCHAR)
    })
    Platform selectByPrimaryKey(Long id);

    @UpdateProvider(type=PlatformSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") Platform record, @Param("example") PlatformExample example);

    @UpdateProvider(type=PlatformSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") Platform record, @Param("example") PlatformExample example);

    @UpdateProvider(type=PlatformSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(Platform record);

    @Update({
        "update platform",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "platform = #{platform,jdbcType=VARCHAR},",
          "code = #{code,jdbcType=VARCHAR},",
          "checkCode = #{checkcode,jdbcType=VARCHAR},",
          "checkSystemToken = #{checksystemtoken,jdbcType=VARCHAR},",
          "checkUrl = #{checkurl,jdbcType=VARCHAR},",
          "alternateField1 = #{alternatefield1,jdbcType=VARCHAR},",
          "alternateField2 = #{alternatefield2,jdbcType=VARCHAR},",
          "alternateField3 = #{alternatefield3,jdbcType=VARCHAR},",
          "alternateField4 = #{alternatefield4,jdbcType=VARCHAR},",
          "alternateField5 = #{alternatefield5,jdbcType=VARCHAR}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(Platform record);
}