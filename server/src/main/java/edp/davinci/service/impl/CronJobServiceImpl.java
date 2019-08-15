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

import edp.core.consts.Consts;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.*;
import edp.davinci.core.enums.CronJobStatusEnum;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.model.RedisMessageEntity;
import edp.davinci.dao.CronJobMapper;
import edp.davinci.dto.cronJobDto.CronJobBaseInfo;
import edp.davinci.dto.cronJobDto.CronJobInfo;
import edp.davinci.dto.cronJobDto.CronJobUpdate;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.model.CronJob;
import edp.davinci.model.User;
import edp.davinci.service.CronJobService;
import edp.davinci.service.ProjectService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static edp.davinci.core.common.Constants.DAVINCI_TOPIC_CHANNEL;

@Slf4j
@Service("cronJobService")
public class CronJobServiceImpl implements CronJobService {
    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ProjectService projectService;

    @Autowired
    private CronJobMapper cronJobMapper;

    @Autowired
    private QuartzUtils quartzUtils;

    @Autowired
    private RedisUtils redisUtils;

    private static final String CRONJOB_KEY = "CRONJOB";


    @Override
    public synchronized boolean isExist(String name, Long id, Long projectId) {
        Long cronJobId = cronJobMapper.getByNameWithProjectId(name, projectId);
        if (null != id && null != cronJobId) {
            return !id.equals(cronJobId);
        }
        return null != cronJobId && cronJobId.longValue() > 0L;
    }

    /**
     * 获取所在project对用户可见的jobs
     *
     * @param projectId
     * @param user
     * @return
     */
    @Override
    public List<CronJob> getCronJobs(Long projectId, User user) {
        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(projectId, user, false);
        } catch (NotFoundException e) {
            return null;
        } catch (UnAuthorizedExecption e) {
            return null;
        }
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        if (projectPermission.getSchedulePermission() < UserPermissionEnum.READ.getPermission()) {
            return null;
        }
        return cronJobMapper.getByProject(projectId);
    }


    /**
     * 创建job
     *
     * @param cronJobBaseInfo
     * @param user
     * @return
     */
    @Override
    @Transactional
    public CronJobInfo createCronJob(CronJobBaseInfo cronJobBaseInfo, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(cronJobBaseInfo.getProjectId(), user, false), user);

        if (projectPermission.getSchedulePermission() < UserPermissionEnum.WRITE.getPermission()) {
            log.info("user {} have not permisson to create job", user.getUsername());
            throw new UnAuthorizedExecption("you have not permission to create job");
        }


        if (isExist(cronJobBaseInfo.getName(), null, cronJobBaseInfo.getProjectId())) {
            log.info("the job {} name is already taken", cronJobBaseInfo.getName());
            throw new ServerException("this job name is already taken");
        }

        CronJob cronJob = new CronJob().createdBy(user.getId());
        BeanUtils.copyProperties(cronJobBaseInfo, cronJob);
        cronJob.setCreateBy(user.getId());
        try {
            cronJob.setStartDate(DateUtils.toDate(cronJobBaseInfo.getStartDate()));
            cronJob.setEndDate(DateUtils.toDate(cronJobBaseInfo.getEndDate()));
        } catch (Exception e) {
            e.printStackTrace();
        }

        int insert = cronJobMapper.insert(cronJob);
        if (insert > 0) {
            optLogger.info("cronJob ({}) is create by (:{})", cronJob.toString(), user.getId());
            CronJobInfo cronJobInfo = new CronJobInfo();
            BeanUtils.copyProperties(cronJobBaseInfo, cronJobInfo);
            cronJobInfo.setId(cronJob.getId());
            cronJobInfo.setJobStatus(CronJobStatusEnum.NEW.getStatus());
            return cronJobInfo;
        } else {
            throw new ServerException("create cronJob fail");
        }
    }

    /**
     * 修改job
     *
     * @param cronJobUpdate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean updateCronJob(CronJobUpdate cronJobUpdate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        CronJob cronJob = cronJobMapper.getById(cronJobUpdate.getId());
        if (null == cronJob) {
            throw new NotFoundException("cronjob is not found");
        }

        if (null != cronJob && !cronJob.getProjectId().equals(cronJobUpdate.getProjectId())) {
            throw new ServerException("Invalid project id");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(cronJob.getProjectId(), user, false), user);

        //校验权限
        if (projectPermission.getSchedulePermission() < UserPermissionEnum.WRITE.getPermission()) {
            log.info("user {} have not permisson to update this job", user.getUsername());
            throw new UnAuthorizedExecption("you have not permission to update this job");
        }

        if (isExist(cronJobUpdate.getName(), cronJobUpdate.getId(), cronJob.getProjectId())) {
            log.info("the cronjob {} name is already taken", cronJobUpdate.getName());
            throw new ServerException("the name is already taken");
        }

        if (CronJobStatusEnum.START.getStatus().equals(cronJob.getJobStatus())) {
            throw new ServerException("Please stop the job before updating");
        }

        String origin = cronJob.toString();
        BeanUtils.copyProperties(cronJobUpdate, cronJob);
        cronJob.updatedBy(user.getId());
        try {
            cronJob.setStartDate(DateUtils.toDate(cronJobUpdate.getStartDate()));
            cronJob.setEndDate(DateUtils.toDate(cronJobUpdate.getEndDate()));

            cronJob.setUpdateTime(new Date());
            int update = cronJobMapper.update(cronJob);
            if (update > 0) {
                optLogger.info("cronJob ({}) is update by (:{}), origin: ({})", cronJob.toString(), user.getId(), origin);
                quartzUtils.modifyJob(cronJob);
            }
        } catch (Exception e) {
            quartzUtils.removeJob(cronJob);
            cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
            cronJobMapper.update(cronJob);

            e.printStackTrace();
        }

        return true;
    }

    /**
     * 删除job
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteCronJob(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        CronJob cronJob = cronJobMapper.getById(id);
        if (null == cronJob) {
            log.info("cronjob (:{}) is not found", id);
            throw new NotFoundException("cronjob is not found");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(cronJob.getProjectId(), user, false), user);

        //校验权限
        if (projectPermission.getSchedulePermission() < UserPermissionEnum.DELETE.getPermission()) {
            log.info("user {} have not permisson to delete the cronjob {}", user.getUsername(), id);
            throw new UnAuthorizedExecption("you have not permission to delete this job");
        }

        int i = cronJobMapper.deleteById(id);
        if (i > 0) {
            optLogger.info("cronjob ({}) is delete by (:{})", cronJob.toString(), user.getId());
            quartzUtils.removeJob(cronJob);
        }

        return true;
    }

    @Override
    @Transactional
    public CronJob startCronJob(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        CronJob cronJob = cronJobMapper.getById(id);
        if (null == cronJob) {
            log.info("cronjob (:{}) is not found", id);
            throw new NotFoundException("cronjob is not found");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(cronJob.getProjectId(), user, false), user);

        //校验权限
        if (projectPermission.getSchedulePermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        try {
            quartzUtils.addJob(cronJob);
            cronJob.setJobStatus(CronJobStatusEnum.START.getStatus());
            cronJob.setUpdateTime(new Date());
            cronJobMapper.update(cronJob);
            return cronJob;
        } catch (ServerException e) {
            cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
            cronJob.setUpdateTime(new Date());
            cronJobMapper.update(cronJob);

            throw e;
        }
    }

    @Override
    @Transactional
    public CronJob stopCronJob(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        CronJob cronJob = cronJobMapper.getById(id);
        if (null == cronJob) {
            log.info("cronjob (:{}) is not found", id);
            throw new NotFoundException("cronjob is not found");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectService.getProjectDetail(cronJob.getProjectId(), user, false), user);

        //校验权限
        if (projectPermission.getSchedulePermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        if (redisUtils.isRedisEnable()) {
            String flag = MD5Util.getMD5(UUID.randomUUID().toString() + id, true, 32);
            redisUtils.convertAndSend(DAVINCI_TOPIC_CHANNEL, new RedisMessageEntity(CronJobHandler.class, id, flag));

            CountDownLatch countDownLatch = new CountDownLatch(1);

            long l = System.currentTimeMillis();

            Thread stopJobThread = new Thread(() -> {
                boolean result = false;
                do {
                    Object o = redisUtils.get(flag);
                    if (o != null) {
                        result = (boolean) o;
                        if (result) {
                            cronJob.setJobStatus(CronJobStatusEnum.STOP.getStatus());
                            countDownLatch.countDown();
                            redisUtils.delete(flag);
                            log.info("CronJob (:{}) is stoped,  and Flag (:{}) is deleted", id, flag);
                            break;
                        }
                    }
                } while (!result);
            });

            stopJobThread.start();

            if ((System.currentTimeMillis() - l) >= 10000L) {
                stopJobThread.interrupt();
                countDownLatch.countDown();
            }

            try {
                countDownLatch.await(15L, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                countDownLatch.countDown();
            }

            return cronJob;
        } else {
            try {
                quartzUtils.removeJob(cronJob);
                cronJob.setJobStatus(CronJobStatusEnum.STOP.getStatus());
                cronJob.setUpdateTime(new Date());
                cronJobMapper.update(cronJob);
                return cronJob;
            } catch (ServerException e) {
                cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
                cronJobMapper.update(cronJob);

                e.printStackTrace();
                return cronJob;
            }
        }
    }


    @Override
    public void startAllJobs() {
        List<CronJob> jobList = cronJobMapper.getStartedJobs();
        if (!CollectionUtils.isEmpty(jobList)) {
            for (CronJob cronJob : jobList) {
                String md5 = MD5Util.getMD5(CRONJOB_KEY + Consts.UNDERLINE + cronJob.getId(), true, 32);
                if (CronJobStatusEnum.START.getStatus().equals(cronJob.getJobStatus()) && null == redisUtils.get(md5)) {
                    try {
                        quartzUtils.addJob(cronJob);
                        redisUtils.set(md5, 1, 5L, TimeUnit.MINUTES);
                    } catch (ServerException e) {
                        log.info(e.getMessage());
                    }
                }
            }
            quartzUtils.startJobs();
        }
    }
}
