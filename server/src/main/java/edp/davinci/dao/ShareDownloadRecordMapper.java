package edp.davinci.dao;

import edp.davinci.model.ShareDownloadRecord;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

public interface ShareDownloadRecordMapper {

    int insertSelective(ShareDownloadRecord record);

    @Select({
            "SELECT * FROM share_download_record WHERE `uuid` = #{uuid, jdbcType=VARCHAR} order by create_time desc limit 10"
    })
    List<ShareDownloadRecord> getShareDownloadRecordsByUuid(String uuid);

    @Update({
            "update share_download_record",
            "set path = #{path,jdbcType=VARCHAR},",
            "status = #{status,jdbcType=SMALLINT},",
            "last_download_time = #{lastDownloadTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int updateById(ShareDownloadRecord record);


}