package edp.davinci.server.enums;


public enum OperateTypeEnum {
	INSERT("insert"),
	UPDATE("update"),
	DELETE("delete");
	private String operate;

	public String getOperate() {
		return operate;
	}

	OperateTypeEnum(String operate) {
		this.operate = operate;
	}
}