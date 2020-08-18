package edp.davinci.server.util;

import edp.davinci.commons.Constants;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.server.dto.cronjob.CronJobTrack;
import edp.davinci.server.dto.statistic.CronJobLog;
import edp.davinci.server.enums.CronJobStepEnum;
import edp.davinci.server.enums.LogNameEnum;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.event.Level;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Component
public class CronJobTrackUtils {

	private static boolean isEnable;

	@Value("${statistic.cronjob_log_enable:false}")
	public void setEnable(boolean enable) {
		isEnable = enable;
	}

	public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm");

	private static final Logger logger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_CRON_JOB.getName());

	public static String generateBatchId(Long jobId) {
		return String.valueOf(jobId) + Constants.AT_SIGN + DATE_FORMATTER.format(LocalDateTime.now());
	}

	public static void info(CronJobTrack cronJobTrack, CronJobStepEnum stepEnum, String state) {
		log(Level.INFO, cronJobTrack, stepEnum, state, null);
	}

	public static void error(CronJobTrack cronJobTrack, CronJobStepEnum stepEnum, String state) {
		log(Level.ERROR, cronJobTrack, stepEnum, state, null);
	}

	private static void log(Level level, CronJobTrack cronJobTrack, CronJobStepEnum stepEnum, String state, Map<String, Object> params) {
		if (isEnable) {
			String message = format(level, cronJobTrack, stepEnum, state, params);
			if (StringUtils.isBlank(message)) {
				return;
			}
			switch (level) {
				case INFO:
					logger.info(message);
					break;
				case ERROR:
					logger.error(message);
					break;
				default:
					break;
			}

		}
	}

	private static String format(Level level, CronJobTrack cronJobTrack, CronJobStepEnum stepEnum, String state, Map<String, Object> params) {
		CronJobLog cronJobLog = new CronJobLog(cronJobTrack);
		cronJobLog.setLevel(level.toString());
		cronJobLog.setStepNum(stepEnum.getStepNum());
		cronJobLog.setStep(stepEnum.getStep());
		cronJobLog.setState(state);
		cronJobLog.setParams(params);
		return  JSONUtils.toString(cronJobLog);
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

		public void info(CronJobTrack cronJobTrack, CronJobStepEnum stepEnum, String state) {
			log(Level.INFO, cronJobTrack, stepEnum, state, params);
		}

		public void error(CronJobTrack cronJobTrack, CronJobStepEnum stepEnum, String state) {
			log(Level.ERROR, cronJobTrack, stepEnum, state, params);
		}

	}

}