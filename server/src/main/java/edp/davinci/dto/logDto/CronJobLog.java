package edp.davinci.dto.logDto;

import lombok.Data;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * @Author : bogeli
 * @Description :
 * @Date : Created in 2020/6/2
 */
@Data
public class CronJobLog {
	private Long cronJobId;
	private  String execLog;
	private String level;
	private Date execTime;
	private Map<String, Object> params;
}
