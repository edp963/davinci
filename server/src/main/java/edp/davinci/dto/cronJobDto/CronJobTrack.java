package edp.davinci.dto.cronJobDto;

import edp.davinci.common.utils.CronJobTrackUtils;
import edp.davinci.model.CronJob;
import lombok.Data;

/**
 * @Author : bogeli
 * @Description :
 * @Date : Created in 2020/7/17
 */
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
