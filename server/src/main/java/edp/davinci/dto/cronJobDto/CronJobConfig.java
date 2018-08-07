package edp.davinci.dto.cronJobDto;

import lombok.Data;

import java.util.List;

@Data
public class CronJobConfig {
    private String to;
    private String cc;
    private String bcc;
    private String subject;
    private String type;
    private List<CronJobContent> contentList;
}
