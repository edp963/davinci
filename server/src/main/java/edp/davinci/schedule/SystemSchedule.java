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
import edp.core.utils.*;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.dao.CronJobMapper;
import edp.davinci.dao.ShareDownloadRecordMapper;
import edp.davinci.model.CronJob;
import edp.davinci.model.ShareDownloadRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;

@Slf4j
@Component
public class SystemSchedule {

    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private CronJobMapper cronJobMapper;

    @Autowired
    private QuartzHandler quartzHandler;

    @Autowired
    private RedisUtils redisUtils;

    @Autowired
    private ShareDownloadRecordMapper shareDownloadRecordMapper;
    @Value("${file.temp.remain.days:7}")
    private int fileTempRemainDays;
    @Value("${thread.pool.health.check.enable:true}")
    private boolean threadPoolHealthCheckEnable;

    private static final int THREAD_POOL_QUEUE_ALARM_SIZE=2000;
    private static final ExecutorService CLEAR_TEMPDIR_THREADPOOL = Executors.newFixedThreadPool(3);

    @Scheduled(cron = "0/5 * * * * *")
    public void clearTempDir() {
        checkThreadPoolExecutorStatus();
        // 下载内容文件默认保留7天，记录保留1月，在月初和月末大数据量导出情况下部分文件删除IO异常失败，导致磁盘空间撑满
        // 可自定义配置文件保留日期配置文件中file.temp.remain.days=n 运维可根据集团实际情况进行配置
        String downloadDir=null ;
        String tempDir=null ;
        try {
            log.debug("下载内容文件默认保留[{}]天,可在配置文件通过file.temp.remain.days=n进行配置",fileTempRemainDays);
            downloadDir = fileUtils.fileBasePath + Consts.DIR_DOWNLOAD + DateUtils.getTheDayBeforeAWeekYYYYMMDD(fileTempRemainDays);
            tempDir = fileUtils.fileBasePath + Consts.DIR_TEMP + DateUtils.getTheDayBeforeNowDateYYYYMMDD();
            String csvDir = fileUtils.fileBasePath + File.separator + FileTypeEnum.CSV.getType();

            final String download = fileUtils.formatFilePath(downloadDir);
            final String temp = fileUtils.formatFilePath(tempDir);
            final String csv = fileUtils.formatFilePath(csvDir);
            log.info("downloadDir:{},tempDir:{},csv:{}",download,temp,csv);
            CLEAR_TEMPDIR_THREADPOOL.execute(() -> FileUtils.deleteDir(new File(download)));
            CLEAR_TEMPDIR_THREADPOOL.execute(() -> FileUtils.deleteDir(new File(temp)));
            CLEAR_TEMPDIR_THREADPOOL.execute(() -> FileUtils.deleteDir(new File(csv)));
        } catch (Exception e) {
           log.error("文件删除定时任务执行异常downloadDir:[{}]，tempDir:[{}],请检查IO以及手动处理临时文件",downloadDir,tempDir);
        }
    }

    @Scheduled(cron = "0 0/2 * * * *")
    public void stopCronJob() {
        List<CronJob> jobs = cronJobMapper.getStoppedJob();
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

        List<ShareDownloadRecord> records = shareDownloadRecordMapper.getShareDownloadRecords();    //deleting
        for(ShareDownloadRecord record : records){
            deleteFile(new File(record.getPath()));
        }

        shareDownloadRecordMapper.deleteByCondition();
    }

    /**
     * 线程池状态健康检查
     * 可通过 thread.pool.health.check.enable=false 关闭监控检查
     * @param
     */
    @Scheduled(cron = "${thread.pool.health.check.cron:0 0 1/1 * * *}")
    public  void checkThreadPoolExecutorStatus(){
        if(!threadPoolHealthCheckEnable){
            return;
        }
        ThreadPoolExecutor tpe = ((ThreadPoolExecutor) CLEAR_TEMPDIR_THREADPOOL);
        int queueSize = tpe.getQueue().size();
        int activeCount = tpe.getActiveCount();
        long completedTaskCount = tpe.getCompletedTaskCount();
        long taskCount = tpe.getTaskCount();
        BlockingQueue<Runnable> queue = tpe.getQueue();
        if(queue.size()>THREAD_POOL_QUEUE_ALARM_SIZE){
            log.warn("当前排队线程数[{}]，当前活动线程数[{}]，执行完成线程数[{}]，总线程数[{}]", queueSize, activeCount, completedTaskCount, taskCount);
         }
        if(queue.size()>THREAD_POOL_QUEUE_ALARM_SIZE*2){
            log.error("线程执行效率异常，可能存在IO异常，当前排队线程数[{}]，当前活动线程数[{}]，执行完成线程数[{}]，总线程数[{}]", queueSize, activeCount, completedTaskCount, taskCount);
        }
        else{
            log.info("当前排队线程数[{}]，当前活动线程数[{}]，执行完成线程数[{}]，总线程数[{}]", queueSize, activeCount, completedTaskCount, taskCount);
        }
    }
    private void deleteFile(File file){
        if(file == null || !file.exists()){
            return;
        }

        if(file.isDirectory()){
            String fileName = file.getName();
            if("download".equals(fileName)){
                return;
            }

            File[] children = file.listFiles();
            if(children.length == 0){
                file.delete();
                deleteFile(file.getParentFile());
            }else{
                return;
            }

        }else{
            File parentDir = file.getParentFile();
            File[] children = parentDir.listFiles();
            if(children.length == 1){
                file.delete();
                deleteFile(parentDir);
            }else{
                file.delete();
            }
        }
    }

}
