package edp.core.exception;

public class UnAuthorizedExecption extends RuntimeException {

    public UnAuthorizedExecption(String message, Throwable cause) {
        super(message, cause);
    }

    public UnAuthorizedExecption(String message) {
        super(message);
    }
}
