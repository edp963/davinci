package edp.davinci.dao;

import edp.davinci.model.DownloadRecord;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

public interface DownloadRecordMapper {

    int insert(DownloadRecord downloadRecord);

    @Delete({
            "delete from download_record where id = #{id,jdbcType=BIGINT}"
    })
    int deleteById(Long id);

    @Select({
            "select * from download_record where id = #{id,jdbcType=BIGINT}"
    })
    DownloadRecord getById(Long id);


    @Select({
            "select * from download_record where user_id = #{userId} order by create_time desc"
    })
    List<DownloadRecord> getDownloadRecordsByUser(Long userId);

    @Update({
            "update download_record",
            "set path = #{path,jdbcType=VARCHAR},",
            "status = #{status,jdbcType=SMALLINT},",
            "last_download_time = #{lastDownloadTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int updateById(DownloadRecord downloadRecord);
}