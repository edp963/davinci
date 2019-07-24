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

import edp.core.common.cache.Caches;
import edp.core.utils.FixSizeLinkedList;
import edp.davinci.core.enums.ActionEnum;
import edp.davinci.core.enums.DownloadTaskStatus;
import edp.davinci.core.enums.DownloadType;
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
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class ShareDownloadServiceImpl extends DownloadCommonService implements ShareDownloadService {

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private ShareService shareService;

    @Override
    public boolean submit(DownloadType downloadType, String uuid, String token, User user, List<DownloadViewExecuteParam> params) {
        ShareInfo shareInfo = shareService.getShareInfo(token, user);

        try {
            List<WidgetContext> widgetList = getWidgetContexts(downloadType, shareInfo.getShareId(), user == null ? shareInfo.getShareUser() : user, params);

            ShareDownloadRecord record = new ShareDownloadRecord();
            record.setName(getDownloadFileName(downloadType, shareInfo.getShareId()));

            Cache cache = cacheManager.getCache(Caches.shareDownloadRecord.name());
            FixSizeLinkedList<ShareDownloadRecord> list = cache.get(uuid, FixSizeLinkedList.class);
            if (list == null) {
                list = new FixSizeLinkedList<ShareDownloadRecord>(10);
            }
            list.addFirst(record);
            cache.put(uuid, list);

            ExecutorUtil.submitWorkbookTask(WorkBookContext.newWorkBookContext(new MsgWrapper(record, ActionEnum.SHAREDOWNLOAD, uuid), widgetList, user, resultLimit));
            return true;
        } catch (Exception e) {
            log.error("submit download task error,e=", e);
            return false;
        }
    }


    @Override
    public FixSizeLinkedList<ShareDownloadRecord> queryDownloadRecordPage(String uuid, String token, User user) {
        shareService.getShareInfo(token, user);

        Cache cache = cacheManager.getCache(Caches.shareDownloadRecord.name());
        return cache.get(uuid, FixSizeLinkedList.class);
    }

    @Override
    public ShareDownloadRecord downloadById(String id, String uuid, String token, User user) {
        shareService.getShareInfo(token, user);
        Cache cache = cacheManager.getCache(Caches.shareDownloadRecord.name());

        FixSizeLinkedList<ShareDownloadRecord> queue = cache.get(uuid, FixSizeLinkedList.class);
        if (queue != null) {
            for (ShareDownloadRecord record : queue) {
                if (record.getId().equals(id)) {
                    record.setLastDownloadTime(new Date());
                    record.setStatus(DownloadTaskStatus.DOWNLOADED.getStatus());
                    return record;
                }
            }
        }
        return null;
    }
}
