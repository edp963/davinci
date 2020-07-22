package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.DownloadRecord;
import edp.davinci.core.dao.entity.DownloadRecordExample;
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
public interface DownloadRecordMapper {
    @SelectProvider(type=DownloadRecordSqlProvider.class, method="countByExample")
    long countByExample(DownloadRecordExample example);

    @DeleteProvider(type=DownloadRecordSqlProvider.class, method="deleteByExample")
    int deleteByExample(DownloadRecordExample example);

    @Delete({
        "delete from download_record",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into download_record (id, `name`, ",
        "user_id, `path`, `status`, ",
        "create_time, last_download_time)",
        "values (#{id,jdbcType=BIGINT}, #{name,jdbcType=VARCHAR}, ",
        "#{userId,jdbcType=BIGINT}, #{path,jdbcType=VARCHAR}, #{status,jdbcType=SMALLINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{lastDownloadTime,jdbcType=TIMESTAMP})"
    })
    int insert(DownloadRecord record);

    @InsertProvider(type=DownloadRecordSqlProvider.class, method="insertSelective")
    int insertSelective(DownloadRecord record);

    @SelectProvider(type=DownloadRecordSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="path", property="path", jdbcType=JdbcType.VARCHAR),
        @Result(column="status", property="status", jdbcType=JdbcType.SMALLINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="last_download_time", property="lastDownloadTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<DownloadRecord> selectByExample(DownloadRecordExample example);

    @Select({
        "select",
        "id, `name`, user_id, `path`, `status`, create_time, last_download_time",
        "from download_record",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="user_id", property="userId", jdbcType=JdbcType.BIGINT),
        @Result(column="path", property="path", jdbcType=JdbcType.VARCHAR),
        @Result(column="status", property="status", jdbcType=JdbcType.SMALLINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="last_download_time", property="lastDownloadTime", jdbcType=JdbcType.TIMESTAMP)
    })
    DownloadRecord selectByPrimaryKey(Long id);

    @UpdateProvider(type=DownloadRecordSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") DownloadRecord record, @Param("example") DownloadRecordExample example);

    @UpdateProvider(type=DownloadRecordSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") DownloadRecord record, @Param("example") DownloadRecordExample example);

    @UpdateProvider(type=DownloadRecordSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(DownloadRecord record);

    @Update({
        "update download_record",
        "set `name` = #{name,jdbcType=VARCHAR},",
          "user_id = #{userId,jdbcType=BIGINT},",
          "`path` = #{path,jdbcType=VARCHAR},",
          "`status` = #{status,jdbcType=SMALLINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "last_download_time = #{lastDownloadTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(DownloadRecord record);
}