package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.DavinciStatisticTerminal;
import edp.davinci.core.dao.entity.DavinciStatisticTerminalExample;
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
public interface DavinciStatisticTerminalMapper {
    @SelectProvider(type=DavinciStatisticTerminalSqlProvider.class, method="countByExample")
    long countByExample(DavinciStatisticTerminalExample example);

    @DeleteProvider(type=DavinciStatisticTerminalSqlProvider.class, method="deleteByExample")
    int deleteByExample(DavinciStatisticTerminalExample example);

    @Delete({
        "delete from davinci_statistic_terminal",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into davinci_statistic_terminal (id, user_id, ",
        "email, browser_name, ",
        "browser_version, engine_name, ",
        "engine_version, os_name, ",
        "os_version, device_model, ",
        "device_type, device_vendor, ",
        "cpu_architecture, create_time)",
        "values (#{id,jdbcType=BIGINT}, #{userId,jdbcType=BIGINT}, ",
        "#{email,jdbcType=VARCHAR}, #{browserName,jdbcType=VARCHAR}, ",
        "#{browserVersion,jdbcType=VARCHAR}, #{engineName,jdbcType=VARCHAR}, ",
        "#{engineVersion,jdbcType=VARCHAR}, #{osName,jdbcType=VARCHAR}, ",
        "#{osVersion,jdbcType=VARCHAR}, #{deviceModel,jdbcType=VARCHAR}, ",
        "#{deviceType,jdbcType=VARCHAR}, #{deviceVendor,jdbcType=VARCHAR}, ",
        "#{cpuArchitecture,jdbcType=VARCHAR}, #{createTime,jdbcType=TIMESTAMP})"
    })
    int insert(DavinciStatisticTerminal record);

    @InsertProvider(type=DavinciStatisticTerminalSqlProvider.class, method="insertSelective")
    int insertSelective(DavinciStatisticTerminal record);

    @SelectProvider(type=DavinciStatisticTerminalSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="email", property="email", jdbcType=JdbcType.VARCHAR),
        @Result(column="browser_name", property="browserName", jdbcType=JdbcType.VARCHAR),
        @Result(column="browser_version", property="browserVersion", jdbcType=JdbcType.VARCHAR),
        @Result(column="engine_name", property="engineName", jdbcType=JdbcType.VARCHAR),
        @Result(column="engine_version", property="engineVersion", jdbcType=JdbcType.VARCHAR),
        @Result(column="os_name", property="osName", jdbcType=JdbcType.VARCHAR),
        @Result(column="os_version", property="osVersion", jdbcType=JdbcType.VARCHAR),
        @Result(column="device_model", property="deviceModel", jdbcType=JdbcType.VARCHAR),
        @Result(column="device_type", property="deviceType", jdbcType=JdbcType.VARCHAR),
        @Result(column="device_vendor", property="deviceVendor", jdbcType=JdbcType.VARCHAR),
        @Result(column="cpu_architecture", property="cpuArchitecture", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<DavinciStatisticTerminal> selectByExample(DavinciStatisticTerminalExample example);

    @Select({
        "select",
        "id, user_id, email, browser_name, browser_version, engine_name, engine_version, ",
        "os_name, os_version, device_model, device_type, device_vendor, cpu_architecture, ",
        "create_time",
        "from davinci_statistic_terminal",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="email", property="email", jdbcType=JdbcType.VARCHAR),
        @Result(column="browser_name", property="browserName", jdbcType=JdbcType.VARCHAR),
        @Result(column="browser_version", property="browserVersion", jdbcType=JdbcType.VARCHAR),
        @Result(column="engine_name", property="engineName", jdbcType=JdbcType.VARCHAR),
        @Result(column="engine_version", property="engineVersion", jdbcType=JdbcType.VARCHAR),
        @Result(column="os_name", property="osName", jdbcType=JdbcType.VARCHAR),
        @Result(column="os_version", property="osVersion", jdbcType=JdbcType.VARCHAR),
        @Result(column="device_model", property="deviceModel", jdbcType=JdbcType.VARCHAR),
        @Result(column="device_type", property="deviceType", jdbcType=JdbcType.VARCHAR),
        @Result(column="device_vendor", property="deviceVendor", jdbcType=JdbcType.VARCHAR),
        @Result(column="cpu_architecture", property="cpuArchitecture", jdbcType=JdbcType.VARCHAR),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP)
    })
    DavinciStatisticTerminal selectByPrimaryKey(Long id);

    @UpdateProvider(type=DavinciStatisticTerminalSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") DavinciStatisticTerminal record, @Param("example") DavinciStatisticTerminalExample example);

    @UpdateProvider(type=DavinciStatisticTerminalSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") DavinciStatisticTerminal record, @Param("example") DavinciStatisticTerminalExample example);

    @UpdateProvider(type=DavinciStatisticTerminalSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(DavinciStatisticTerminal record);

    @Update({
        "update davinci_statistic_terminal",
        "set user_id = #{userId,jdbcType=BIGINT},",
          "email = #{email,jdbcType=VARCHAR},",
          "browser_name = #{browserName,jdbcType=VARCHAR},",
          "browser_version = #{browserVersion,jdbcType=VARCHAR},",
          "engine_name = #{engineName,jdbcType=VARCHAR},",
          "engine_version = #{engineVersion,jdbcType=VARCHAR},",
          "os_name = #{osName,jdbcType=VARCHAR},",
          "os_version = #{osVersion,jdbcType=VARCHAR},",
          "device_model = #{deviceModel,jdbcType=VARCHAR},",
          "device_type = #{deviceType,jdbcType=VARCHAR},",
          "device_vendor = #{deviceVendor,jdbcType=VARCHAR},",
          "cpu_architecture = #{cpuArchitecture,jdbcType=VARCHAR},",
          "create_time = #{createTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(DavinciStatisticTerminal record);
}