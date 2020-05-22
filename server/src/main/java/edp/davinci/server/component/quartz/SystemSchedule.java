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

package edp.davinci.server.component.quartz;

import edp.davinci.commons.util.DateUtils;
import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.core.dao.entity.ShareDownloadRecord;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dao.CronJobExtendMapper;
import edp.davinci.server.dao.ShareDownloadRecordExtendMapper;
import edp.davinci.server.enums.FileTypeEnum;
import edp.davinci.server.exception.ServerException;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.util.FileUtils;
import edp.davinci.server.util.QuartzHandler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class SystemSchedule {

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private CronJobExtendMapper cronJobExtendMapper;

    @Autowired
    private QuartzHandler quartzHandler;

    @Autowired
    private ShareDownloadRecordExtendMapper shareDownloadRecordExtendMapper;
    
    private static final ExecutorService CLEAR_TEMPDIR_THREADPOOL = Executors.newFixedThreadPool(3);

    @Scheduled(cron = "0 0 1 * * *")
    public void clearTempDir() {

        //下载内容文件保留7天，记录保留1月
        String downloadDir = fileUtils.fileBasePath + Constants.DIR_DOWNLOAD + DateUtils.getAWeekBeforeYYYYMMDD();
        String tempDir = fileUtils.fileBasePath + Constants.DIR_TEMPL + DateUtils.getAMonthBeforeYYYYMMDD();
        String csvDir = fileUtils.fileBasePath + File.separator + FileTypeEnum.CSV.getType();

        final String download = fileUtils.formatFilePath(downloadDir);
        final String temp = fileUtils.formatFilePath(tempDir);
        final String csv = fileUtils.formatFilePath(csvDir);

        CLEAR_TEMPDIR_THREADPOOL.execute(() -> FileUtils.deleteDir(new File(download)));
        CLEAR_TEMPDIR_THREADPOOL.execute(() -> FileUtils.deleteDir(new File(temp)));
        CLEAR_TEMPDIR_THREADPOOL.execute(() -> FileUtils.deleteDir(new File(csv)));
    }

    @Scheduled(cron = "0 0/2 * * * *")
    public void stopCronJob() {
        List<CronJob> jobs = cronJobExtendMapper.getStopedJob();
        if (!CollectionUtils.isEmpty(jobs)) {
            for (CronJob job : jobs) {
                try {
                    quartzHandler.removeJob(job);
                } catch (ServerException e) {
                
                }
            }
        }
    }

    @Scheduled(cron = "0 0 1 * * *")
    public void clearShareDownloadRecord() {

        List<ShareDownloadRecord> records = shareDownloadRecordExtendMapper.getShareDownloadRecords();    //deleting
        for(ShareDownloadRecord record : records){
            deleteFile(new File(record.getPath()));
        }

        shareDownloadRecordExtendMapper.delete();
    }

	private void deleteFile(File file) {
		if (file == null || !file.exists()) {
			return;
		}

		if (file.isDirectory()) {
			String fileName = file.getName();
			if ("download".equals(fileName)) {
				return;
			}

			File[] childs = file.listFiles();
			if (childs.length == 0) {
				file.delete();
				deleteFile(file.getParentFile());
			} else {
				return;
			}

		} else {
			File parentDir = file.getParentFile();
			File[] childs = parentDir.listFiles();
			if (childs.length == 1) {
				file.delete();
				deleteFile(parentDir);
			} else {
				file.delete();
			}
		}
	}

}
