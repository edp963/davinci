package edp.davinci.model;

import edp.core.model.ScheduleJob;
import edp.davinci.core.enums.CronJobStatusEnum;
import lombok.Data;

import java.util.Date;

@Data
public class CronJob extends ScheduleJob {

    private Long id;

    private String name;

    private Long projectId;

    private String jobType;

    private String config;

    private String jobStatus = CronJobStatusEnum.NEW.getStatus();

    private String execLog;

    private String cronExpression;

    private Date startDate;

    private Date endDate;

    private String description;

    private Long createBy;

    private Date createTime = new Date();

    private Date updateTime;
}