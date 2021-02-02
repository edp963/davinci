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

package edp.davinci.server.service.impl;

import edp.davinci.core.dao.entity.ShareDownloadRecord;
import edp.davinci.core.enums.DownloadRecordStatusEnum;
import edp.davinci.server.aspect.ShareAuthAspect;
import edp.davinci.server.commons.ErrorMsg;
import edp.davinci.server.component.excel.ExecutorUtils;
import edp.davinci.server.component.excel.MsgWrapper;
import edp.davinci.server.component.excel.WidgetContext;
import edp.davinci.server.component.excel.WorkBookContext;
import edp.davinci.server.dao.ShareDownloadRecordExtendMapper;
import edp.davinci.server.dto.project.ProjectDetail;
import edp.davinci.server.dto.project.ProjectPermission;
import edp.davinci.server.dto.share.ShareFactor;
import edp.davinci.server.dto.view.DownloadViewExecuteParam;
import edp.davinci.server.enums.ActionEnum;
import edp.davinci.server.enums.DownloadType;
import edp.davinci.server.exception.UnAuthorizedException;
import edp.davinci.server.service.ShareDownloadService;
import edp.davinci.server.service.ShareService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class ShareDownloadServiceImpl extends DownloadCommonService implements ShareDownloadService {

    @Autowired
    private ShareDownloadRecordExtendMapper shareDownloadRecordExtendMapper;

    @Autowired
    private ShareService shareService;

    @Override
    public boolean submit(DownloadType downloadType, String uuid, List<DownloadViewExecuteParam> params) {
        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        try {
            List<WidgetContext> widgetList = getWidgetContexts(downloadType, shareFactor.getEntityId(), shareFactor.getUser(), params);

            ShareDownloadRecord record = new ShareDownloadRecord();
            record.setUuid(uuid);
            record.setName(getDownloadFileName(downloadType, shareFactor.getEntityId()));
            record.setStatus(DownloadRecordStatusEnum.PROCESSING.getStatus());
            record.setCreateTime(new Date());
            shareDownloadRecordExtendMapper.insertSelective(record);

            MsgWrapper wrapper = new MsgWrapper(record, ActionEnum.SHAREDOWNLOAD, uuid);
            WorkBookContext workBookContext = WorkBookContext.builder()
                    .wrapper(wrapper)
                    .widgets(widgetList)
                    .user(shareFactor.getUser())
                    .resultLimit(resultLimit)
                    .taskKey("ShareDownload_" + uuid)
                    .build();
            ExecutorUtils.submitWorkbookTask(workBookContext, null);
            log.info("Share download task submit:{}", wrapper);
            return true;
        } catch (Exception e) {
            log.error("Submit download task error, e=", e);
            return false;
        }
    }


    @Override
    public List<ShareDownloadRecord> queryDownloadRecordPage(String uuid) {
        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        ProjectDetail projectDetail = shareFactor.getProjectDetail();
        if (projectDetail == null) {
            return null;
        }
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, shareFactor.getUser());
        if (!projectPermission.getDownloadPermission()) {
            return null;
        }
        return shareDownloadRecordExtendMapper.getByUuid(uuid);
    }

    @Override
    public ShareDownloadRecord downloadById(String id, String uuid) throws UnAuthorizedException {
        ShareFactor shareFactor = ShareAuthAspect.SHARE_FACTOR_THREAD_LOCAL.get();
        ProjectDetail projectDetail = shareFactor.getProjectDetail();
        if (projectDetail == null) {
            throw new UnAuthorizedException(ErrorMsg.ERR_PERMISSION);
        }
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, shareFactor.getUser());
        if (!projectPermission.getDownloadPermission()) {
            throw new UnAuthorizedException(ErrorMsg.ERR_PERMISSION);
        }
        ShareDownloadRecord record = shareDownloadRecordExtendMapper.getByIdAndUuid(Long.valueOf(id), uuid);
        if (record != null) {
            record.setLastDownloadTime(new Date());
            record.setStatus(DownloadRecordStatusEnum.DOWNLOADED.getStatus());
            shareDownloadRecordExtendMapper.update(record);
            return record;
        } else {
            return null;
        }
    }
}
