package edp.davinci.core.dao;

import edp.davinci.core.dao.entity.ShareDownloadRecord;
import edp.davinci.core.dao.entity.ShareDownloadRecordExample;
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
public interface ShareDownloadRecordMapper {
    @SelectProvider(type=ShareDownloadRecordSqlProvider.class, method="countByExample")
    long countByExample(ShareDownloadRecordExample example);

    @DeleteProvider(type=ShareDownloadRecordSqlProvider.class, method="deleteByExample")
    int deleteByExample(ShareDownloadRecordExample example);

    @Delete({
        "delete from share_download_record",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int deleteByPrimaryKey(Long id);

    @Insert({
        "insert into share_download_record (id, uuid, ",
        "`name`, `path`, `status`, ",
        "create_time, last_download_time)",
        "values (#{id,jdbcType=BIGINT}, #{uuid,jdbcType=VARCHAR}, ",
        "#{name,jdbcType=VARCHAR}, #{path,jdbcType=VARCHAR}, #{status,jdbcType=SMALLINT}, ",
        "#{createTime,jdbcType=TIMESTAMP}, #{lastDownloadTime,jdbcType=TIMESTAMP})"
    })
    int insert(ShareDownloadRecord record);

    @InsertProvider(type=ShareDownloadRecordSqlProvider.class, method="insertSelective")
    int insertSelective(ShareDownloadRecord record);

    @SelectProvider(type=ShareDownloadRecordSqlProvider.class, method="selectByExample")
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="uuid", property="uuid", jdbcType=JdbcType.VARCHAR),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="path", property="path", jdbcType=JdbcType.VARCHAR),
        @Result(column="status", property="status", jdbcType=JdbcType.SMALLINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="last_download_time", property="lastDownloadTime", jdbcType=JdbcType.TIMESTAMP)
    })
    List<ShareDownloadRecord> selectByExample(ShareDownloadRecordExample example);

    @Select({
        "select",
        "id, uuid, `name`, `path`, `status`, create_time, last_download_time",
        "from share_download_record",
        "where id = #{id,jdbcType=BIGINT}"
    })
    @Results({
        @Result(column="id", property="id", jdbcType=JdbcType.BIGINT, id=true),
        @Result(column="uuid", property="uuid", jdbcType=JdbcType.VARCHAR),
        @Result(column="name", property="name", jdbcType=JdbcType.VARCHAR),
        @Result(column="path", property="path", jdbcType=JdbcType.VARCHAR),
        @Result(column="status", property="status", jdbcType=JdbcType.SMALLINT),
        @Result(column="create_time", property="createTime", jdbcType=JdbcType.TIMESTAMP),
        @Result(column="last_download_time", property="lastDownloadTime", jdbcType=JdbcType.TIMESTAMP)
    })
    ShareDownloadRecord selectByPrimaryKey(Long id);

    @UpdateProvider(type=ShareDownloadRecordSqlProvider.class, method="updateByExampleSelective")
    int updateByExampleSelective(@Param("record") ShareDownloadRecord record, @Param("example") ShareDownloadRecordExample example);

    @UpdateProvider(type=ShareDownloadRecordSqlProvider.class, method="updateByExample")
    int updateByExample(@Param("record") ShareDownloadRecord record, @Param("example") ShareDownloadRecordExample example);

    @UpdateProvider(type=ShareDownloadRecordSqlProvider.class, method="updateByPrimaryKeySelective")
    int updateByPrimaryKeySelective(ShareDownloadRecord record);

    @Update({
        "update share_download_record",
        "set uuid = #{uuid,jdbcType=VARCHAR},",
          "`name` = #{name,jdbcType=VARCHAR},",
          "`path` = #{path,jdbcType=VARCHAR},",
          "`status` = #{status,jdbcType=SMALLINT},",
          "create_time = #{createTime,jdbcType=TIMESTAMP},",
          "last_download_time = #{lastDownloadTime,jdbcType=TIMESTAMP}",
        "where id = #{id,jdbcType=BIGINT}"
    })
    int updateByPrimaryKey(ShareDownloadRecord record);
}