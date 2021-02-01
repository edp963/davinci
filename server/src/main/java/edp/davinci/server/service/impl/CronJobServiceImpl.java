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

import edp.davinci.commons.util.DateUtils;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.core.dao.entity.User;
import edp.davinci.core.enums.CronJobStatusEnum;
import edp.davinci.server.component.excel.ExecutorUtils;
import edp.davinci.server.component.quartz.ScheduleService;
import edp.davinci.server.config.SpringContextHolder;
import edp.davinci.server.dao.CronJobExtendMapper;
import edp.davinci.server.dto.cronjob.CronJobBaseInfo;
import edp.davinci.server.dto.cronjob.CronJobInfo;
import edp.davinci.server.dto.cronjob.CronJobUpdate;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedException;
import edp.davinci.server.model.RedisMessageEntity;
import edp.davinci.server.service.CronJobService;
import edp.davinci.server.util.BaseLock;
import edp.davinci.server.util.QuartzHandler;
import edp.davinci.server.util.RedisUtils;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.concurrent.ExecutorService;

import static edp.davinci.server.commons.Constants.DAVINCI_TOPIC_CHANNEL;

@Slf4j
@Service("cronJobService")
public class CronJobServiceImpl extends BaseEntityService implements CronJobService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());
	
	private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

	@Autowired
	private CronJobExtendMapper cronJobExtendMapper;

	@Autowired
	private SchedulerFactoryBean schedulerFactoryBean;

	@Autowired
	private QuartzHandler quartzHandler;

	@Autowired
	private RedisUtils redisUtils;
	
	private static final CheckEntityEnum entity = CheckEntityEnum.CRONJOB;

	@Override
	public boolean isExist(String name, Long id, Long projectId) {
		Long cronJobId = cronJobExtendMapper.getByNameWithProjectId(name, projectId);
		if (null != id && null != cronJobId) {
			return !id.equals(cronJobId);
		}
		return null != cronJobId && cronJobId.longValue() > 0L;
	}
	
	private void checkIsExist(String name, Long id, Long projectId) {
		if (isExist(name, id, projectId)) {
			alertNameTaken(entity, name);
		}
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
		return checkReadPermission(entity, projectId, user) == true ? cronJobExtendMapper.getByProject(projectId) : null;
	}

	@Override
	public CronJob getCronJob(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException {
		CronJob cronJob = cronJobExtendMapper.selectByPrimaryKey(id);
		return checkReadPermission(entity, cronJob.getProjectId(), user) == true ? cronJob : null;
	}
	
	private CronJob getCronJob(Long id) {
	
		CronJob cronJob = cronJobExtendMapper.selectByPrimaryKey(id);

		if (null == cronJob) {
			log.error("Cronjob({}) is not found", id);
			throw new NotFoundException("Cronjob is not found");
		}
		
		return cronJob;
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
	public CronJobInfo createCronJob(CronJobBaseInfo cronJobBaseInfo, User user)
			throws NotFoundException, UnAuthorizedException, ServerException {

		Long projectId = cronJobBaseInfo.getProjectId();
		checkWritePermission(entity, projectId, user, "create");

		String name = cronJobBaseInfo.getName();
		checkIsExist(name, null, projectId);

		BaseLock lock = getLock(entity, name, projectId);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}

		CronJob cronJob = new CronJob();
		cronJob.setCreateBy((user.getId()));
		cronJob.setCreateTime(new Date());
		cronJob.setJobStatus(CronJobStatusEnum.NEW.getStatus());
		BeanUtils.copyProperties(cronJobBaseInfo, cronJob);
		try {
			cronJob.setStartDate(DateUtils.toDate(cronJobBaseInfo.getStartDate()));
			cronJob.setEndDate(DateUtils.toDate(cronJobBaseInfo.getEndDate()));
		} catch (Exception e) {
			log.error(e.toString(), e);
		}

		try {
			insertCronJob(cronJob);
			optLogger.info("CronJob({}) is create by user({})", cronJob.getId(), user.getId());

			CronJobInfo cronJobInfo = new CronJobInfo();
			BeanUtils.copyProperties(cronJobBaseInfo, cronJobInfo);
			cronJobInfo.setId(cronJob.getId());
			cronJobInfo.setJobStatus(CronJobStatusEnum.NEW.getStatus());
			return cronJobInfo;

		} finally {
			releaseLock(lock);
		}
	}
	
	@Transactional
	protected void insertCronJob(CronJob cronJob) {
		if (cronJobExtendMapper.insertSelective(cronJob) != 1) {
			throw new ServerException("Create cronJob fail");
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
	public boolean updateCronJob(CronJobUpdate cronJobUpdate, User user)
			throws NotFoundException, UnAuthorizedException, ServerException {
		
		Long id = cronJobUpdate.getId();
		Long projectId = cronJobUpdate.getProjectId();
		CronJob cronJob = getCronJob(id);
		if (!cronJob.getProjectId().equals(projectId)) {
			throw new ServerException("Invalid project id " + projectId);
		}

		checkWritePermission(entity, projectId, user, "update");

		String name = cronJobUpdate.getName();
		checkIsExist(name, id, projectId);

		if (CronJobStatusEnum.START.getStatus().equals(cronJob.getJobStatus())) {
			throw new ServerException("Please stop the job before updating");
		}
		
		BaseLock lock = getLock(entity, name, projectId);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}
		
		BeanUtils.copyProperties(cronJobUpdate, cronJob);
		cronJob.setUpdateBy(user.getId());
		cronJob.setUpdateTime(new Date());
		String origin = cronJob.toString();
		try {
			cronJob.setStartDate(DateUtils.toDate(cronJobUpdate.getStartDate()));
			cronJob.setEndDate(DateUtils.toDate(cronJobUpdate.getEndDate()));
			cronJob.setUpdateTime(new Date());
			if(updateCronJob(cronJob, cronJobUpdate, user)) {
				optLogger.info("CronJob({}) is update by user({}), origin:{}", id, user.getId(), origin);
				return true;
			}
		}catch (Exception e) {
			throw new ServerException(e.getMessage());
		}finally {
			releaseLock(lock);
		}

		return false;
	}
	
	@Transactional
	protected boolean updateCronJob(CronJob cronJob, CronJobUpdate cronJobUpdate, User user) {
		try {
			cronJob.setStartDate(DateUtils.toDate(cronJobUpdate.getStartDate()));
			cronJob.setEndDate(DateUtils.toDate(cronJobUpdate.getEndDate()));
			cronJob.setUpdateTime(new Date());
			if (cronJobExtendMapper.update(cronJob) == 1) {
				quartzHandler.modifyJob(cronJob);
				return true;
			}
		} catch (Exception e) {
			log.error(e.toString(), e);
			quartzHandler.removeJob(cronJob);
			cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
			cronJobExtendMapper.update(cronJob);
		}
		
		return false;
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
	public boolean deleteCronJob(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException {

		CronJob cronJob = getCronJob(id);

		checkWritePermission(entity, cronJob.getProjectId(), user, "delete");

		if (cronJobExtendMapper.deleteByPrimaryKey(id) == 1) {
			optLogger.info("Cronjob({}) is delete by user({})", id, user.getId());
			quartzHandler.removeJob(cronJob);
			return true;
		}

		return false;
	}

	@Override
	@Transactional
	public CronJob startCronJob(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException {

		CronJob cronJob = getCronJob(id);

		checkWritePermission(entity, cronJob.getProjectId(), user, "start");

		try {
			quartzHandler.addJob(cronJob);
			cronJob.setJobStatus(CronJobStatusEnum.START.getStatus());
			cronJob.setUpdateTime(new Date());
			cronJobExtendMapper.update(cronJob);
			return cronJob;
		} catch (SchedulerException e) {
			log.error(e.toString(), e);
			cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
			cronJob.setUpdateTime(new Date());
			cronJobExtendMapper.update(cronJob);
			throw new ServerException(e.getMessage());
		}
	}

	private void publishReconnect(String message) {

		// String flag = MD5Utils.getMD5(UUID.randomUUID().toString() + id, true, 32);
		// the flag is deprecated
		String flag = "-1";
		redisUtils.convertAndSend(DAVINCI_TOPIC_CHANNEL, new RedisMessageEntity(CronJobMessageHandler.class,  message, flag));
	}
	
	@Override
	@Transactional
	public CronJob stopCronJob(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException {
		
		CronJob cronJob = getCronJob(id);

		checkWritePermission(entity, cronJob.getProjectId(), user, "stop");

		cronJob.setJobStatus(CronJobStatusEnum.STOP.getStatus());

		if (redisUtils.isRedisEnable()) {
			publishReconnect(JSONUtils.toString(cronJob));
			return cronJob;
		}

		try {
			quartzHandler.removeJob(cronJob);
			cronJob.setUpdateTime(new Date());
			cronJobExtendMapper.update(cronJob);
		} catch (ServerException e) {
			log.error(e.toString(), e);
			cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
			cronJobExtendMapper.update(cronJob);
		}
		
		return cronJob;
	}

	@Override
	public void restartAllJobs() {

		Scheduler scheduler = schedulerFactoryBean.getScheduler();
		try {
			scheduler.clear();
		} catch (SchedulerException e) {
			log.error("CronJob clear fail");
			log.error(e.toString(), e);
			return;
		}

		List<CronJob> jobList = cronJobExtendMapper.getStartedJobs();
		jobList.forEach((cronJob) -> {
			try {
				quartzHandler.addJob(cronJob);
			} catch (SchedulerException e) {
				log.warn("CronJob({}) name:{} is start error:{}", cronJob.getId(), cronJob.getName(),
						e.getMessage());
				cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
				cronJobExtendMapper.update(cronJob);
			} catch (ServerException e) {
				log.warn("CronJob({}) name:{} is start error:{}", cronJob.getId(), cronJob.getName(),
						e.getMessage());
			}
		});
	}

	@Override
	public boolean executeCronJob(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException {

		CronJob cronJob = getCronJob(id);

		checkWritePermission(entity, cronJob.getProjectId(), user, "execute");

		ExecutorService executorService = ExecutorUtils.getJobWorkers();
		ExecutorUtils.printThreadPoolStatus(executorService, "JOB_WORKERS", scheduleLogger);

		executorService.submit(() -> {
			String jobType = cronJob.getJobType().trim();
			ScheduleService scheduleService = (ScheduleService) SpringContextHolder.getBean(jobType + "ScheduleService");
			if (scheduleService == null) {
				scheduleLogger.warn("ScheduleJob({}) Unknown job type {}", cronJob.getId(), jobType);
				return;
			}

			try {
				scheduleService.execute(cronJob.getId());
			} catch (Exception e) {
				scheduleLogger.error("ScheduleJob({}) execute error", cronJob.getId());
				scheduleLogger.error(e.toString(), e);
			}
		});

		return true;
	}
}
