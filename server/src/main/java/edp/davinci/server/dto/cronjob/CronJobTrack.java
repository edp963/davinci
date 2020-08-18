package edp.davinci.server.dto.cronjob;

import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.server.util.CronJobTrackUtils;
import lombok.Data;

@Data
public class CronJobTrack {
	private Long cronJobId;
	private String batchId;
	private String name;
	private String jobType;

	public CronJobTrack(CronJob cronJob) {
		this.cronJobId = cronJob.getId();
		this.batchId = CronJobTrackUtils.generateBatchId(cronJobId);
		this.name = cronJob.getName();
		this.jobType = cronJob.getJobType();
	}
}
