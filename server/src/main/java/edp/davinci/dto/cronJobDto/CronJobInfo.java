package edp.davinci.dto.cronJobDto;

import lombok.Data;

@Data
public class CronJobInfo extends CronJobBaseInfo {
    private Long id;

    private String jobStatus;
}
