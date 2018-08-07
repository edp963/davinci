package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.cronJobDto.CronJobBaseInfo;
import edp.davinci.dto.cronJobDto.CronJobUpdate;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;

public interface CronJobService extends CheckEntityService {
    ResultMap getCronJobs(Long projectId, User user, HttpServletRequest request);

    ResultMap createCronJob(CronJobBaseInfo cronJobBaseInfo, User user, HttpServletRequest request);

    ResultMap updateCronJob(CronJobUpdate cronJobUpdate, User user, HttpServletRequest request);

    ResultMap deleteCronJob(Long id, User user, HttpServletRequest request);

    ResultMap startCronJob(Long id, User user, HttpServletRequest request);

    ResultMap stopCronJob(Long id, User user, HttpServletRequest request);
}
