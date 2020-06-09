package edp.davinci.common.utils;

import com.alibaba.fastjson.JSON;
import edp.davinci.dto.logDto.CronJobLog;
import org.slf4j.Logger;

import java.util.HashMap;
import java.util.Map;

/**
 * @Author : bogeli
 * @Description :
 * @Date : Created in 2020/6/2
 */
public class CronJobLogUtils {

	private static final String INFO = "info";

	private static final String ERROR = "error";

	public static void info(Long jobId, String execLog, Logger customLogger) {
		log(INFO, jobId, execLog, customLogger, null);
	}

	public static void error(Long jobId, String execLog, Logger customLogger) {
		log(ERROR, jobId, execLog, customLogger, null);
	}

	private static void log(String level, Long jobId, String execLog, Logger customLogger, Map<String, Object> params) {
		customLogger.info(formatLog(level, jobId, execLog, params));
	}

	private static String formatLog(String level, Long jobId, String execLog, Map<String, Object> params) {
		CronJobLog cronJobLog = new CronJobLog();
		cronJobLog.setLevel(level);
		cronJobLog.setCronJobId(jobId);
		cronJobLog.setExecLog(execLog);
		cronJobLog.setParams(params);
		return JSON.toJSONString(cronJobLog);
	}

	public static Builder getBuilder() {
		return new Builder();
	}

	public static class Builder {
		private Map<String, Object> params = new HashMap<>();

		public Builder appendParam(String key, Object value) {
			this.params.put(key, value);
			return this;
		}

		public void info(Long jobId, String execLog, Logger customLogger) {
			log(INFO, jobId, execLog, customLogger, params);
		}

		public void error(Long jobId, String execLog, Logger customLogger) {
			log(ERROR, jobId, execLog, customLogger, params);
		}

	}

}
