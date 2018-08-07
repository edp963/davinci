package edp.core.common.job;

import com.alibaba.druid.util.StringUtils;
import edp.core.model.ScheduleJob;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;

public class QuartzJobFactory implements Job {

    @Autowired
    private BeanFactory beanFactory;

    @Override
    public void execute(JobExecutionContext jobExecutionContext) {
        ScheduleJob scheduleJob = (ScheduleJob) jobExecutionContext.getMergedJobDataMap().get("jobs");

        if (scheduleJob.getStartDate().getTime() <= System.currentTimeMillis()
                && scheduleJob.getEndDate().getTime() >= System.currentTimeMillis()) {
            String jobType = scheduleJob.getJobType().trim();

            if (!StringUtils.isEmpty(jobType)) {
                ScheduleService scheduleService = (ScheduleService) beanFactory.getBean(jobType + "ScheduleService");
                try {
                    scheduleService.execute(scheduleJob.getId());
                } catch (Exception e) {
                    e.printStackTrace();
                    return;
                }
            }
        }
    }
}
