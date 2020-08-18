package edp.davinci.server.dto.statistic;


import edp.davinci.server.dto.cronjob.CronJobTrack;
import lombok.Data;

import java.util.Date;
import java.util.Map;

@Data
public class CronJobLog {
	private Long cronJobId;
	private String name;
	private String jobType;
	private String batchId;
	private int stepNum;
	private String step;
	private String level;
	private String state;
	private Date execTime;
	private Map<String, Object> params;

	public CronJobLog() {
	}

	public CronJobLog(CronJobTrack cronJobTrack) {
		this.cronJobId = cronJobTrack.getCronJobId();
		this.batchId = cronJobTrack.getBatchId();
		this.name = cronJobTrack.getName();
		this.jobType = cronJobTrack.getJobType();
	}
}


