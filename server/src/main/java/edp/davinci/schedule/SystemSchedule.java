/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2018 EDP
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
import edp.core.utils.DateUtils;
import edp.core.utils.FileUtils;
import edp.davinci.core.enums.FileTypeEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;

@Slf4j
@Component
public class SystemSchedule {

    @Autowired
    public FileUtils fileUtils;

    @Scheduled(cron = "0 0 1 * * *")
    public void clearTempDir() {
        String downloadDir = fileUtils.fileBasePath + Consts.DIR_DOWNLOAD + DateUtils.getTheDayBeforNowDateYYYYMMDD();
        String tempDir = fileUtils.fileBasePath + Consts.DIR_TEMPL + DateUtils.getTheDayBeforNowDateYYYYMMDD();
        String csvDir = fileUtils.fileBasePath + File.separator + FileTypeEnum.CSV.getType();

        final String download = fileUtils.formatFilePath(downloadDir);
        final String temp = fileUtils.formatFilePath(tempDir);
        final String csv = fileUtils.formatFilePath(csvDir);

        new Thread(() -> fileUtils.deleteDir(new File(download))).start();
        new Thread(() -> fileUtils.deleteDir(new File(temp))).start();
        new Thread(() -> fileUtils.deleteDir(new File(csv))).start();
    }
}
