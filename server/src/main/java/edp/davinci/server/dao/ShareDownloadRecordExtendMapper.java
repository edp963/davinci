package edp.davinci.server.dao;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import edp.davinci.core.dao.ShareDownloadRecordMapper;
import edp.davinci.core.dao.entity.ShareDownloadRecord;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface ShareDownloadRecordExtendMapper extends ShareDownloadRecordMapper {

    @Delete({"delete from share_download_record where id not in" +
            "(" +
            "    select tmp.id" +
            "    from" +
            "    (" +
            "        select a1.id" +
            "        from share_download_record a1" +
            "        inner join" +
            "        (" +
            "        select a.uuid, a.`create_time`" +
            "        from share_download_record a" +
            "        left join share_download_record b on a.uuid = b.uuid and a.create_time <= b.create_time" +
            "        where a.create_time > date_format((now() - interval 2 day),'%Y%m%d')" +
            "        and b.create_time > date_format((now() - interval 2 day),'%Y%m%d')" +
            "        group by a.uuid, a.create_time" +
            "        having count(b.create_time)<=10" +
            "        ) b1" +
            "        on a1.uuid = b1.uuid and a1.`create_time` = b1.create_time" +
            "        order by a1.uuid, a1.`create_time` desc" +
            "    ) as tmp" +
            ")"})
    int delete();

    @Select({
            "select * from share_download_record where id = #{id, jdbcType=BIGINT} and `uuid` = #{uuid, jdbcType=VARCHAR}"
    })
    ShareDownloadRecord getByIdAndUuid(@Param("id") Long id,  @Param("uuid") String uuid);

    @Select({
            "select * from share_download_record where `uuid` = #{uuid, jdbcType=VARCHAR} and create_time > date_format((now() - interval 2 day),'%Y%m%d') order by create_time desc limit 10"
    })
    List<ShareDownloadRecord> getByUuid(@Param("uuid") String uuid);

    @Update({
            "update share_download_record",
            "set path = #{path,jdbcType=VARCHAR},",
            "status = #{status,jdbcType=SMALLINT},",
            "last_download_time = #{lastDownloadTime,jdbcType=TIMESTAMP}",
            "where id = #{id,jdbcType=BIGINT}"
    })
    int update(ShareDownloadRecord record);

    @Select({"select * from share_download_record where id not in" +
            "(" +
            "    select tmp.id" +
            "    from" +
            "    (" +
            "        select a1.id" +
            "        from share_download_record a1" +
            "        inner join" +
            "        (" +
            "        select a.uuid, a.`create_time`" +
            "        from share_download_record a" +
            "        left join share_download_record b on a.uuid = b.uuid and a.create_time <= b.create_time" +
            "        where a.create_time > date_format((now() - interval 2 day),'%Y%m%d')" +
            "        and b.create_time > date_format((now() - interval 2 day),'%Y%m%d')" +
            "        group by a.uuid, a.create_time" +
            "        having count(b.create_time)<=10" +
            "        ) b1" +
            "        on a1.uuid = b1.uuid and a1.`create_time` = b1.create_time" +
            "        order by a1.uuid, a1.`create_time` desc" +
            "    ) as tmp" +
            ")"})
    List<ShareDownloadRecord> getShareDownloadRecords();

}