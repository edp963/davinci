package edp.davinci.dto.cronJobDto;

import edp.davinci.common.utils.CronJobTrackUtils;
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

	public CronJobTrack(Long cronJobId, String name, String jobType) {
		this.cronJobId = cronJobId;
		this.batchId = CronJobTrackUtils.generateBatchId(cronJobId);
		this.name = name;
		this.jobType = jobType;
	}
}
