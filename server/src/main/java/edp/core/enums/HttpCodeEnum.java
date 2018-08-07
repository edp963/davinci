package edp.core.enums;

public enum HttpCodeEnum {

    OK(200, "OK"),
    FAIL(400, "Bad Request"),
    UNAUTHORIZED(401, "Unauthorized"),
    NOT_FOUND(404, "Not Found"),
    SERVER_ERROR(500, "Internal Server Error");

    private int code;
    private String message;

    HttpCodeEnum(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public static HttpCodeEnum codeOf(int code) {
        for (HttpCodeEnum codeEnum : values()) {
            if (codeEnum.code == code) {
                return codeEnum;
            }
        }
        return null;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
