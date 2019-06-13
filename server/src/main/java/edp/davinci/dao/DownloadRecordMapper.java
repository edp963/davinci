/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2019 EDP
 *  ==
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *        http://www.apache.org/licenses/LICENSE-2.0
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *  >>
 *
 */

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


    @Delete({
            "delete from download_record where create_time < DATE_FORMAT((NOW() - INTERVAL 1 MONTH),'%Y%m%d')"
    })
    int deleteBeforAMonthRecord();


    @Select({
            "select * from download_record where user_id = #{userId} and create_time > DATE_FORMAT((NOW() - INTERVAL 7 DAY),'%Y%m%d')  order by create_time desc"
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