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

package edp.davinci.server.component.excel;

import edp.davinci.server.config.SpringContextHolder;
import edp.davinci.server.dao.CronJobExtendMapper;
import edp.davinci.server.dao.DownloadRecordMapper;
import edp.davinci.server.dao.ShareDownloadRecordMapper;
import edp.davinci.server.dto.cronjob.MsgMailExcel;
import edp.davinci.server.enums.DownloadTaskStatusType;
import edp.davinci.server.model.DownloadRecord;
import edp.davinci.server.model.ShareDownloadRecord;
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
                    record.setStatus(DownloadTaskStatusType.SUCCESS.getStatus());
                    record.setPath(wrapper.getRst());
                } else {
                    record.setStatus(DownloadTaskStatusType.FAILED.getStatus());
                }
                ((DownloadRecordMapper) SpringContextHolder.getBean(DownloadRecordMapper.class)).updateById(record);
                log.info("DownloadAction record is updated status=" + record.getStatus());
                break;
            case MAIL:
                MsgMailExcel msg = (MsgMailExcel) wrapper.getMsg();
                if (msg.getException() != null) {
                    ((CronJobExtendMapper) SpringContextHolder.getBean(CronJobExtendMapper.class)).updateExecLog(msg.getId(), msg.toString());
                    log.error("MailAction error, CronJob: (:{}), {}", msg.getId(), msg.getException().getMessage());
                } else {
                    log.info("MailAction finish, CronJob: (:{}), {}", msg.getId(), wrapper.getxUUID());
                }
                break;

            case SHAREDOWNLOAD:
                ShareDownloadRecord shareDownloadRecord = (ShareDownloadRecord) wrapper.getMsg();
                if (shareDownloadRecord == null) {
                    log.error("ShareDownloadAction record is null,nothing to do");
                    break;
                }

                if (StringUtils.isNotEmpty(wrapper.getRst())) {
                    shareDownloadRecord.setStatus(DownloadTaskStatusType.SUCCESS.getStatus());
                    shareDownloadRecord.setPath(wrapper.getRst());
                } else {
                    shareDownloadRecord.setStatus(DownloadTaskStatusType.FAILED.getStatus());
                }
                ((ShareDownloadRecordMapper) SpringContextHolder.getBean(ShareDownloadRecordMapper.class)).updateById(shareDownloadRecord);
                log.info("ShareDownloadAction record is updated status=" + shareDownloadRecord.getStatus());
                break;
        }
    }
}