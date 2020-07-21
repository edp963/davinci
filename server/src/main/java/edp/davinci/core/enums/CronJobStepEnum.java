package edp.davinci.core.enums;

public enum CronJobStepEnum {
	MAIL_1_PARSE_CONFIG(1, "parse config"),
	MAIL_2_GENERATE_SHARE_IMAGES(2, "generate share images"),
	MAIL_3_SCREEN_SHOT(3,"screen shot"),
	MAIL_4_GENERATE_SHARE_EXCEL(4,"generate share excel"),
	MAIL_5_SEND_MAIL(5,"send mail"),
	; {

	}
	private int stepNum;
	private String step;

	CronJobStepEnum(int stepNum, String step) {
		this.stepNum = stepNum;
		this.step = step;
	}

	public int getStepNum() {
		return stepNum;
	}

	public String getStep() {
		return step;
	}
}
