package edp.davinci.dao;

import edp.davinci.model.ShareDownloadRecord;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

public interface ShareDownloadRecordMapper {

    @Delete({"DELETE FROM share_download_record WHERE id NOT IN\n" +
            "(\n" +
            "    SELECT tmp.id\n" +
            "    FROM\n" +
            "    (\n" +
            "        SELECT a1.id\n" +
            "        FROM share_download_record a1\n" +
            "        INNER JOIN\n" +
            "        (\n" +
            "        SELECT a.uuid, a.`create_time`\n" +
            "        FROM share_download_record a\n" +
            "        LEFT JOIN share_download_record b ON a.uuid = b.uuid AND a.create_time <= b.create_time\n" +
            "        WHERE a.create_time > DATE_FORMAT((NOW() - INTERVAL 2 DAY),'%Y%m%d')\n" +
            "        AND b.create_time > DATE_FORMAT((NOW() - INTERVAL 2 DAY),'%Y%m%d')\n" +
            "        GROUP BY a.uuid, a.create_time\n" +
            "        HAVING COUNT(b.create_time)<=10\n" +
            "        ) b1\n" +
            "        ON a1.uuid = b1.uuid AND a1.`create_time` = b1.create_time\n" +
            "        ORDER BY a1.uuid, a1.`create_time` DESC\n" +
            "    ) AS tmp\n" +
            ")\n"})
    int deleteByCondition();

    int insertSelective(ShareDownloadRecord record);

    @Select({
            "SELECT * FROM share_download_record WHERE id = #{id, jdbcType=BIGINT} and `uuid` = #{uuid, jdbcType=VARCHAR}"
    })
    ShareDownloadRecord getShareDownloadRecordBy(@Param("id") Long id,  @Param("uuid") String uuid);

    @Select({
            "SELECT * FROM share_download_record WHERE `uuid` = #{uuid, jdbcType=VARCHAR} and create_time > DATE_FORMAT((NOW() - INTERVAL 2 DAY),'%Y%m%d') order by create_time desc limit 10"
    })
    List<ShareDownloadRecord> getShareDownloadRecordsByUuid(@Param("uuid") String uuid);

    @Update({
            "update share_download_record",
            "set path = #{path,jdbcType=VARCHAR},",
            "status = #{status,jdbcType=SMALLINT},",
            "last_download_time = #{lastDownloadTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int updateById(ShareDownloadRecord record);

    @Select({"SELECT * FROM share_download_record WHERE id NOT IN\n" +
            "(\n" +
            "    SELECT tmp.id\n" +
            "    FROM\n" +
            "    (\n" +
            "        SELECT a1.id\n" +
            "        FROM share_download_record a1\n" +
            "        INNER JOIN\n" +
            "        (\n" +
            "        SELECT a.uuid, a.`create_time`\n" +
            "        FROM share_download_record a\n" +
            "        LEFT JOIN share_download_record b ON a.uuid = b.uuid AND a.create_time <= b.create_time\n" +
            "        WHERE a.create_time > DATE_FORMAT((NOW() - INTERVAL 2 DAY),'%Y%m%d')\n" +
            "        AND b.create_time > DATE_FORMAT((NOW() - INTERVAL 2 DAY),'%Y%m%d')\n" +
            "        GROUP BY a.uuid, a.create_time\n" +
            "        HAVING COUNT(b.create_time)<=10\n" +
            "        ) b1\n" +
            "        ON a1.uuid = b1.uuid AND a1.`create_time` = b1.create_time\n" +
            "        ORDER BY a1.uuid, a1.`create_time` DESC\n" +
            "    ) AS tmp\n" +
            ")\n"})
    List<ShareDownloadRecord> getShareDownloadRecords();

}