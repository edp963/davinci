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

import static edp.davinci.core.common.Constants.DAVINCI_TOPIC_CHANNEL;

import java.util.Date;
import java.util.List;

import edp.core.utils.*;
import edp.davinci.core.enums.LockType;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSON;

import edp.core.common.quartz.QuartzJobExecutor;
import edp.core.consts.Consts;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.enums.CronJobStatusEnum;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.model.RedisMessageEntity;
import edp.davinci.dao.CronJobMapper;
import edp.davinci.dto.cronJobDto.CronJobBaseInfo;
import edp.davinci.dto.cronJobDto.CronJobInfo;
import edp.davinci.dto.cronJobDto.CronJobUpdate;
import edp.davinci.model.CronJob;
import edp.davinci.model.User;
import edp.davinci.service.CronJobService;
import edp.davinci.service.excel.ExecutorUtil;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("cronJobService")
public class CronJobServiceImpl extends BaseEntityService implements CronJobService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());
	
	private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

	@Autowired
	private CronJobMapper cronJobMapper;

	@Autowired
	private QuartzHandler quartzHandler;

	@Autowired
	private RedisUtils redisUtils;
	
	@Autowired
	private EmailScheduleServiceImpl emailScheduleService;

	private static final CheckEntityEnum entity = CheckEntityEnum.CRONJOB;

	@Override
	public boolean isExist(String name, Long id, Long projectId) {
		Long cronJobId = cronJobMapper.getByNameWithProjectId(name, projectId);
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
		return checkReadPermission(entity, projectId, user) == true ? cronJobMapper.getByProject(projectId) : null;
	}

	@Override
	public CronJob getCronJob(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
		CronJob cronJob = cronJobMapper.getById(id);
		return checkReadPermission(entity, cronJob.getProjectId(), user) == true ? cronJob : null;
	}
	
	private CronJob getCronJob(Long id) {
	
		CronJob cronJob = cronJobMapper.getById(id);

		if (null == cronJob) {
			log.info("cronjob (:{}) is not found", id);
			throw new NotFoundException("cronjob is not found");
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
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		Long projectId = cronJobBaseInfo.getProjectId();
		checkWritePermission(entity, projectId, user, "create");

		String name = cronJobBaseInfo.getName();
		checkIsExist(name, null, projectId);

		BaseLock lock = getLock(entity, name, projectId);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}

		CronJob cronJob = new CronJob().createdBy(user.getId());
		BeanUtils.copyProperties(cronJobBaseInfo, cronJob);
		try {
			cronJob.setStartDate(DateUtils.toDate(cronJobBaseInfo.getStartDate()));
			cronJob.setEndDate(DateUtils.toDate(cronJobBaseInfo.getEndDate()));
		} catch (Exception e) {
			log.error(e.getMessage(), e);
		}

		try {

			if (cronJobMapper.insert(cronJob) != 1) {
				throw new ServerException("create cronJob fail");
			}

			CronJobInfo cronJobInfo = new CronJobInfo();
			BeanUtils.copyProperties(cronJobBaseInfo, cronJobInfo);
			cronJobInfo.setId(cronJob.getId());
			cronJobInfo.setJobStatus(CronJobStatusEnum.NEW.getStatus());

			optLogger.info("cronJob ({}) is create by (:{})", cronJob.toString(), user.getId());
			return cronJobInfo;

		} finally {
			releaseLock(lock);
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
			throws NotFoundException, UnAuthorizedExecption, ServerException {
		
		Long id = cronJobUpdate.getId();
		Long projectId = cronJobUpdate.getProjectId();
		CronJob cronJob = getCronJob(id);
		if (!cronJob.getProjectId().equals(projectId)) {
			throw new ServerException("Invalid project id");
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
		cronJob.updatedBy(user.getId());
		String origin = cronJob.toString();
		boolean res = false;
		try {
			cronJob.setStartDate(DateUtils.toDate(cronJobUpdate.getStartDate()));
			cronJob.setEndDate(DateUtils.toDate(cronJobUpdate.getEndDate()));
			cronJob.setUpdateTime(new Date());
			if (cronJobMapper.update(cronJob) == 1) {
				optLogger.info("cronJob ({}) is update by (:{}), origin: ({})", cronJob.toString(), user.getId(), origin);
				quartzHandler.modifyJob(cronJob);
				res = true;
			}
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			quartzHandler.removeJob(cronJob);
			cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
			cronJobMapper.update(cronJob);
		} finally {
			releaseLock(lock);
		}

		return res;
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

		CronJob cronJob = getCronJob(id);

		checkWritePermission(entity, cronJob.getProjectId(), user, "delete");

		if (cronJobMapper.deleteById(id) == 1) {
			optLogger.info("cronjob ({}) is delete by (:{})", cronJob.toString(), user.getId());
			quartzHandler.removeJob(cronJob);
			return true;
		}

		return false;
	}

	@Override
	@Transactional
	public CronJob startCronJob(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

		CronJob cronJob = getCronJob(id);

		checkWritePermission(entity, cronJob.getProjectId(), user, "start");

		try {
			quartzHandler.addJob(cronJob);
			cronJob.setJobStatus(CronJobStatusEnum.START.getStatus());
			cronJob.setUpdateTime(new Date());
			cronJobMapper.update(cronJob);
			return cronJob;
		} catch (SchedulerException e) {
			cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
			cronJob.setUpdateTime(new Date());
			cronJobMapper.update(cronJob);
			throw new ServerException(e.getMessage());
		}
	}

	private void publishReconnect(String message) {

		//	String flag = MD5Util.getMD5(UUID.randomUUID().toString() + id, true, 32);
		// the flag is deprecated
		String flag = "-1";
		redisUtils.convertAndSend(DAVINCI_TOPIC_CHANNEL, new RedisMessageEntity(CronJobMessageHandler.class,  message, flag));
	}
	
	@Override
	@Transactional
	public CronJob stopCronJob(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
		
		CronJob cronJob = getCronJob(id);

		checkWritePermission(entity, cronJob.getProjectId(), user, "stop");

		cronJob.setJobStatus(CronJobStatusEnum.STOP.getStatus());

		if (redisUtils.isRedisEnable()) {
			publishReconnect(JSON.toJSONString(cronJob));
			return cronJob;
		}

		try {
			quartzHandler.removeJob(cronJob);
			cronJob.setUpdateTime(new Date());
			cronJobMapper.update(cronJob);
		} catch (ServerException e) {
			log.error(e.getMessage(), e);
			cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
			cronJobMapper.update(cronJob);
		}
		
		return cronJob;
	}

	@Override
	public void startAllJobs() {
		List<CronJob> jobList = cronJobMapper.getStartedJobs();
		jobList.forEach((cronJob) -> {
			String key = entity.getSource().toUpperCase() + Consts.UNDERLINE + cronJob.getId() + Consts.UNDERLINE
					+ cronJob.getProjectId();
			if (LockFactory.getLock(key, 300, LockType.REDIS).getLock()) {
				try {
					quartzHandler.addJob(cronJob);
				} catch (SchedulerException e) {
					log.warn("CronJob: {} (id: {}), start error: {}", cronJob.getName(), cronJob.getId(),  e.getMessage());
					cronJob.setJobStatus(CronJobStatusEnum.FAILED.getStatus());
					cronJobMapper.update(cronJob);
				} catch (ServerException e) {
					log.warn("CronJob: {} (id: {}), start error: {}", cronJob.getName(), cronJob.getId(), e.getMessage());
				}
			}
		});
	}

	@Override
	public boolean executeCronJob(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

		CronJob cronJob = getCronJob(id);

		checkWritePermission(entity, cronJob.getProjectId(), user, "execute");

		ExecutorUtil.printThreadPoolStatusLog(QuartzJobExecutor.executorService, "Cronjob_Executor", scheduleLogger);

		QuartzJobExecutor.executorService.submit(() -> {
			if (cronJob.getStartDate().getTime() <= System.currentTimeMillis()
					&& cronJob.getEndDate().getTime() >= System.currentTimeMillis()) {
				String jobType = cronJob.getJobType().trim();

				if (!StringUtils.isEmpty(jobType)) {
					try {
						emailScheduleService.execute(cronJob.getId());
					} catch (Exception e) {
						log.error(e.getMessage(), e);
						scheduleLogger.error(e.getMessage());
					}
				} else {
					log.warn("Unknown job type [{}], job ID: (:{})", jobType, cronJob.getId());
					scheduleLogger.warn("Unknown job type [{}], job ID: (:{})", jobType, cronJob.getId());
				}
			} else {
				Object[] args = { cronJob.getId(), DateUtils.toyyyyMMddHHmmss(System.currentTimeMillis()),
						DateUtils.toyyyyMMddHHmmss(cronJob.getStartDate()),
						DateUtils.toyyyyMMddHHmmss(cronJob.getEndDate()), cronJob.getCronExpression() };
				log.warn(
						"ScheduleJob (:{}), current time [{}] is not within the planned execution time, StartTime: [{}], EndTime: [{}], Cron Expression: [{}]",
						args);
				scheduleLogger.warn(
						"ScheduleJob (:{}), current time [{}] is not within the planned execution time, StartTime: [{}], EndTime: [{}], Cron Expression: [{}]",
						args);
			}
		});

		return true;
	}

}
