package edp.davinci.dto.cronJobDto;

import edp.davinci.model.CronJob;
import edp.davinci.model.Project;
import lombok.Data;

import java.text.SimpleDateFormat;

@Data
public class CronJobWithProject extends CronJob {
    private Project project;


    public CronJobInfo toCrobJobInfo() {
        CronJobInfo cronJobInfo = new CronJobInfo();
        cronJobInfo.setId(this.getId());
        cronJobInfo.setName(this.getName());
        cronJobInfo.setProjectId(this.getProjectId());
        cronJobInfo.setJobStatus(this.getJobStatus());
        cronJobInfo.setJobType(this.getJobType());
        cronJobInfo.setConfig(this.getConfig());
        cronJobInfo.setCronExpression(this.getCronExpression());

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        cronJobInfo.setStartDate(sdf.format(this.getStartDate()));
        cronJobInfo.setEndDate(sdf.format(this.getEndDate()));
        cronJobInfo.setDescription(this.getDescription());

        return cronJobInfo;
    }
}
