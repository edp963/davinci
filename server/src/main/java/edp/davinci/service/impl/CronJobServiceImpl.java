/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.service.impl;

import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.core.utils.DateUtils;
import edp.core.utils.QuartzUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.CronJobStatusEnum;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.dao.CronJobMapper;
import edp.davinci.dao.ProjectMapper;
import edp.davinci.dto.cronJobDto.CronJobBaseInfo;
import edp.davinci.dto.cronJobDto.CronJobInfo;
import edp.davinci.dto.cronJobDto.CronJobUpdate;
import edp.davinci.dto.cronJobDto.CronJobWithProject;
import edp.davinci.model.CronJob;
import edp.davinci.model.Project;
import edp.davinci.model.RelUserOrganization;
import edp.davinci.model.User;
import edp.davinci.service.CronJobService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;

@Slf4j
@Service("cronJobService")
public class CronJobServiceImpl extends CommonService<CronJob> implements CronJobService {

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private CronJobMapper cronJobMapper;

    @Autowired
    private QuartzUtils quartzUtils;

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
     * @param request
     * @return
     */
    @Override
    public ResultMap getCronJobs(Long projectId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(projectId);

        if (null == project) {
            log.info("project {} not found", project);
            return resultMap.successAndRefreshToken(request).message("project not found");
        }

        if (!allowRead(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<CronJob> cronJobs = cronJobMapper.getByProject(projectId);

        if (!allowRead(project, user)) {
            cronJobs = null;
        }

        return resultMap.successAndRefreshToken(request).payloads(cronJobs);
    }


    /**
     * 创建job
     *
     * @param cronJobBaseInfo
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createCronJob(CronJobBaseInfo cronJobBaseInfo, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(cronJobBaseInfo.getProjectId());

        if (isExist(cronJobBaseInfo.getName(), null, cronJobBaseInfo.getProjectId())) {
            log.info("the job {} name is already taken", cronJobBaseInfo.getName());
            return resultMap.failAndRefreshToken(request).message("this job name is already taken");
        }

        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create job", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create job");
        }

        CronJob cronJob = new CronJob();
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
            CronJobInfo cronJobInfo = new CronJobInfo();
            BeanUtils.copyProperties(cronJobBaseInfo, cronJobInfo);
            cronJobInfo.setId(cronJob.getId());
            cronJobInfo.setJobStatus(CronJobStatusEnum.NEW.getStatus());
            return resultMap.successAndRefreshToken(request).payload(cronJobInfo);
        } else {
            return resultMap.failAndRefreshToken(request).message("create cronJob fail");
        }
    }

    /**
     * 修改job
     *
     * @param cronJobUpdate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateCronJob(CronJobUpdate cronJobUpdate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        CronJobWithProject cronJobWithProject = cronJobMapper.getCronJobWithProjectById(cronJobUpdate.getId());
        if (null == cronJobWithProject) {
            return resultMap.failAndRefreshToken(request).message("cronjob not found");
        }

        Project project = cronJobWithProject.getProject();
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to update this job", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to update this job");
        }

        if (isExist(cronJobUpdate.getName(), cronJobUpdate.getId(), project.getId())) {
            log.info("the cronjob {} name is already taken", cronJobUpdate.getName());
            return resultMap.failAndRefreshToken(request).message("the name is already taken");
        }

        CronJob cronJob = new CronJob();
        BeanUtils.copyProperties(cronJobUpdate, cronJob);
        try {
            cronJob.setStartDate(DateUtils.toDate(cronJobUpdate.getStartDate()));
            cronJob.setEndDate(DateUtils.toDate(cronJobUpdate.getEndDate()));
        } catch (Exception e) {
            cronJobWithProject.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
            cronJobMapper.update(cronJobWithProject);

            e.printStackTrace();
        }
        cronJob.setUpdateTime(new Date());
        int update = cronJobMapper.update(cronJob);
        if (update > 0) {
            quartzUtils.modifyJob(cronJob);
        }

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 删除job
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteCronJob(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        CronJobWithProject cronJobWithProject = cronJobMapper.getCronJobWithProjectById(id);
        if (null == cronJobWithProject) {
            return resultMap.failAndRefreshToken(request).message("cronjob not found");
        }


        if (null == cronJobWithProject.getProject()) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowDelete(cronJobWithProject.getProject(), user)) {
            log.info("user {} have not permisson to delete the cronjob {}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to delete this job");
        }

        int i = cronJobMapper.deleteById(id);
        if (i > 0) {
            quartzUtils.removeJob(cronJobWithProject);
        }

        return resultMap.successAndRefreshToken(request);
    }

    @Override
    @Transactional
    public ResultMap startCronJob(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        CronJobWithProject cronJobWithProject = cronJobMapper.getCronJobWithProjectById(id);
        if (null == cronJobWithProject) {
            return resultMap.failAndRefreshToken(request).message("cronjob not found");
        }

        Project project = cronJobWithProject.getProject();
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to start this job", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to start this job");
        }

        try {
            quartzUtils.addJob(cronJobWithProject);
            cronJobWithProject.setJobStatus(CronJobStatusEnum.START.getStatus());
            cronJobWithProject.setUpdateTime(new Date());
            cronJobMapper.update(cronJobWithProject);
            return resultMap.successAndRefreshToken(request).payload(cronJobWithProject.toCrobJobInfo());
        } catch (ServerException e) {
            cronJobWithProject.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
            cronJobWithProject.setUpdateTime(new Date());
            cronJobMapper.update(cronJobWithProject);

            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResultMap stopCronJob(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        CronJobWithProject cronJobWithProject = cronJobMapper.getCronJobWithProjectById(id);
        if (null == cronJobWithProject) {
            return resultMap.failAndRefreshToken(request).message("cronjob not found");
        }

        Project project = cronJobWithProject.getProject();
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to stop this job", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to stop this job");
        }

        try {
            quartzUtils.removeJob(cronJobWithProject);
            cronJobWithProject.setJobStatus(CronJobStatusEnum.STOP.getStatus());
            cronJobWithProject.setUpdateTime(new Date());
            cronJobMapper.update(cronJobWithProject);
            return resultMap.successAndRefreshToken(request).payload(cronJobWithProject.toCrobJobInfo());
        } catch (ServerException e) {
            cronJobWithProject.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
            cronJobMapper.update(cronJobWithProject);

            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }
    }


    @Override
    public void startAllJobs() {
        List<CronJob> jobList = cronJobMapper.getStartedJobs();
        if (null != jobList && jobList.size() > 0) {
            for (CronJob cronJob : jobList) {
                if (CronJobStatusEnum.START.getStatus().equals(cronJob.getJobStatus())) {
                    quartzUtils.addJob(cronJob);
                }
            }
        }
    }
}
