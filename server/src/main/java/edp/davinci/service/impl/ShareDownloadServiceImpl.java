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

package edp.davinci.service.impl;

import edp.core.exception.ForbiddenExecption;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.davinci.core.enums.ActionEnum;
import edp.davinci.core.enums.DownloadTaskStatus;
import edp.davinci.core.enums.DownloadType;
import edp.davinci.dao.ShareDownloadRecordMapper;
import edp.davinci.dto.shareDto.ShareInfo;
import edp.davinci.dto.viewDto.DownloadViewExecuteParam;
import edp.davinci.model.ShareDownloadRecord;
import edp.davinci.model.User;
import edp.davinci.service.ShareDownloadService;
import edp.davinci.service.ShareService;
import edp.davinci.service.excel.ExecutorUtil;
import edp.davinci.service.excel.MsgWrapper;
import edp.davinci.service.excel.WidgetContext;
import edp.davinci.service.excel.WorkBookContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class ShareDownloadServiceImpl extends DownloadCommonService implements ShareDownloadService {

    @Autowired
    private ShareDownloadRecordMapper shareDownloadRecordMapper;

    @Autowired
    private ShareService shareService;

    @Override
    public boolean submit(DownloadType downloadType, String uuid, String token, User user, List<DownloadViewExecuteParam> params) {
        ShareInfo shareInfo = shareService.getShareInfo(token, user);

        try {
            List<WidgetContext> widgetList = getWidgetContexts(downloadType, shareInfo.getShareId(), shareInfo.getShareUser(), params);

            ShareDownloadRecord record = new ShareDownloadRecord();
            record.setUuid(uuid);
            record.setName(getDownloadFileName(downloadType, shareInfo.getShareId()));
            record.setStatus(DownloadTaskStatus.PROCESSING.getStatus());
            record.setCreateTime(new Date());
            shareDownloadRecordMapper.insertSelective(record);

            MsgWrapper wrapper = new MsgWrapper(record, ActionEnum.SHAREDOWNLOAD, uuid);
            WorkBookContext workBookContext = WorkBookContext.WorkBookContextBuilder.newBuildder()
                    .withWrapper(wrapper)
                    .withWidgets(widgetList)
                    .withUser(shareInfo.getShareUser())
                    .withResultLimit(resultLimit)
                    .withTaskKey("ShareDownload_" + uuid)
                    .build();
            ExecutorUtil.submitWorkbookTask(workBookContext, null);
            log.info("Share download task submit: {}", wrapper);
            return true;
        } catch (UnAuthorizedExecption | ServerException e) {
            throw e;
        } catch (Exception e) {
            log.error("submit download task error,e=", e);
            return false;
        }
    }


    @Override
    public List<ShareDownloadRecord> queryDownloadRecordPage(String uuid, String token, User user) {
        shareService.getShareInfo(token, user);

        return shareDownloadRecordMapper.getShareDownloadRecordsByUuid(uuid);
    }

    @Override
    public ShareDownloadRecord downloadById(String id, String uuid, String token, User user) {
        //share download 只校验token是否正确，不校验权限，走分享人权限
        try {
            shareService.getShareInfo(token, user);
        } catch (ServerException e) {
            throw e;
        } catch (ForbiddenExecption e) {
            log.warn("auth share download: record: [id: {}, uuid: {}] type", id, uuid);
        }

        ShareDownloadRecord record = shareDownloadRecordMapper.getShareDownloadRecordBy(Long.valueOf(id), uuid);

        if (record != null) {
            record.setLastDownloadTime(new Date());
            record.setStatus(DownloadTaskStatus.DOWNLOADED.getStatus());
            shareDownloadRecordMapper.updateById(record);
            return record;
        } else {
            return null;
        }
    }
}
