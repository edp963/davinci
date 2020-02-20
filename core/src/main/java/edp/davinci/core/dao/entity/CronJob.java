package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class CronJob {
    private Long id;

    private String name;

    private Long projectId;

    private String jobType;

    private String jobStatus;

    private String cronExpression;

    private Date startDate;

    private Date endDate;

    private String config;

    private String description;

    private String execLog;

    private Long createBy;

    private Date createTime;

    private String updateBy;

    private Date updateTime;

    private Long parentId;

    private String fullParentId;

    private Boolean isFolder;

    private Integer index;
}