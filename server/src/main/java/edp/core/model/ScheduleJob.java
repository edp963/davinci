package edp.core.model;

import lombok.Data;

import java.util.Date;

@Data
public class ScheduleJob {

    private Long id;

    private String jobType;

    private String description;

    private String cronExpression;

    private Date startDate;

    private Date endDate;
}
