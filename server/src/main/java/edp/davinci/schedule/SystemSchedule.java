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

package edp.davinci.schedule;

import edp.core.consts.Consts;
import edp.core.exception.ServerException;
import edp.core.utils.CollectionUtils;
import edp.core.utils.DateUtils;
import edp.core.utils.FileUtils;
import edp.core.utils.QuartzUtils;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.dao.CronJobMapper;
import edp.davinci.dao.ShareDownloadRecordMapper;
import edp.davinci.model.CronJob;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.List;

@Slf4j
@Component
public class SystemSchedule {

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private CronJobMapper cronJobMapper;

    @Autowired
    private QuartzUtils quartzUtils;

    @Autowired
    private ShareDownloadRecordMapper shareDownloadRecordMapper;


    @Scheduled(cron = "0 0 1 * * *")
    public void clearTempDir() {

        //下载内容文件保留7天，记录保留1月
        String downloadDir = fileUtils.fileBasePath + Consts.DIR_DOWNLOAD + DateUtils.getTheDayBeforAWeekYYYYMMDD();
        String tempDir = fileUtils.fileBasePath + Consts.DIR_TEMPL + DateUtils.getTheDayBeforNowDateYYYYMMDD();
        String csvDir = fileUtils.fileBasePath + File.separator + FileTypeEnum.CSV.getType();

        final String download = fileUtils.formatFilePath(downloadDir);
        final String temp = fileUtils.formatFilePath(tempDir);
        final String csv = fileUtils.formatFilePath(csvDir);

        new Thread(() -> FileUtils.deleteDir(new File(download))).start();
        new Thread(() -> FileUtils.deleteDir(new File(temp))).start();
        new Thread(() -> FileUtils.deleteDir(new File(csv))).start();
    }

    @Scheduled(cron = "0 0/2 * * * *")
    public void stopCronJob() {
        List<CronJob> jobs = cronJobMapper.getStopedJob();
        if (!CollectionUtils.isEmpty(jobs)) {
            for (CronJob job : jobs) {
                try {
                    quartzUtils.removeJob(job);
                } catch (ServerException e) {
                }
            }
        }
    }

    @Scheduled(cron = "0 0 1 * * *")
    public void clearShareDownloadRecord() {
        shareDownloadRecordMapper.deleteByCondition();
    }

}
