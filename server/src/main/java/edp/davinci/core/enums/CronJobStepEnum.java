package edp.davinci.core.enums;

public enum CronJobStepEnum {
	MAIL_1_PARSE_CONFIG(1, "parse config"),
	MAIL_WECHAT_2_GENERATE_VIZ(2, "generate viz"),
	MAIL_WECHAT_3_SCREEN_SHOT(3,"screen shot"),
	MAIL_4_GENERATE_EXCEL(4,"generate excel"),
	MAIL_5_SEND(5,"send mail"),
	WECHAT_1_PARSE_CONFIG(1, "parse config"),
	WECHAT_4_SEND(4,"send wechat")
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
