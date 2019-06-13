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

package edp.davinci.service.excel;

import edp.davinci.core.config.SpringContextHolder;
import edp.davinci.core.enums.DownloadTaskStatus;
import edp.davinci.dao.DownloadRecordMapper;
import edp.davinci.model.DownloadRecord;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/30 16:27
 * To change this template use File | Settings | File Templates.
 */
@Slf4j
public abstract class MsgNotifier {


    protected void tell(MsgWrapper wrapper) {
        if (wrapper == null || wrapper.getMsg() == null) {
            log.error("wrapper is null,nothing to do");
            return;
        }
        switch (wrapper.getAction()) {
            case DOWNLOAD:
                DownloadRecord record = (DownloadRecord) wrapper.getMsg();
                if (record == null) {
                    log.error("DownloadAction record is null,nothing to do");
                    break;
                }
                if (StringUtils.isNotEmpty(wrapper.getRst())) {
                    record.setStatus(DownloadTaskStatus.SUCCESS.getStatus());
                    record.setPath(wrapper.getRst());
                } else {
                    record.setStatus(DownloadTaskStatus.FAILED.getStatus());
                }
                ((DownloadRecordMapper) SpringContextHolder.getBean(DownloadRecordMapper.class)).updateById(record);
                log.info("DownloadAction record is updated status=" + record.getStatus());
                break;
            case MAIL:
                log.info("MailAction,nothing to do");
                break;
        }
    }
}
