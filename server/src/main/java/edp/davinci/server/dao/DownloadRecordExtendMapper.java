/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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

package edp.davinci.server.dao;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import edp.davinci.core.dao.DownloadRecordMapper;
import edp.davinci.core.dao.entity.DownloadRecord;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface DownloadRecordExtendMapper extends DownloadRecordMapper {

    @Delete({
            "delete from download_record where create_time < date_format((now() - interval 1 month),'%y%m%d')"
    })
    int deleteBeforeAMonthRecord();


    @Select({
            "select * from download_record where user_id = #{userId} and create_time > date_format((now() - interval 7 day),'%y%m%d')  order by create_time desc"
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