package edp.davinci.core.enums;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/30 10:13
 * To change this template use File | Settings | File Templates.
 */
public enum DownloadTaskStatus {
    PROCESSING((short) 1),
    SUCCESS((short)2),
    FAILED((short)3)
    ;
    private short status;

    private DownloadTaskStatus(short status){
        this.status=status;
    }

    public short getStatus() {
        return status;
    }

    public void setStatus(short status) {
        this.status = status;
    }
}
