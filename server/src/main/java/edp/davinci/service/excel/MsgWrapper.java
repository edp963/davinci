package edp.davinci.service.excel;

import edp.davinci.core.enums.ActionEnum;
import lombok.ToString;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/30 16:32
 * To change this template use File | Settings | File Templates.
 */
@ToString
public class MsgWrapper<T> {

    public T msg;

    private ActionEnum action;

    private String rst;

    public Long xId;

    public MsgWrapper(T msg,ActionEnum action,Long xId){
        this.msg=msg;
        this.action=action;
        this.xId=xId;
    }

    public T getMsg() {
        return msg;
    }

    public void setMsg(T msg) {
        this.msg = msg;
    }

    public ActionEnum getAction() {
        return action;
    }

    public void setAction(ActionEnum action) {
        this.action = action;
    }

    public String getRst() {
        return rst;
    }

    public void setRst(String rst) {
        this.rst = rst;
    }

    public Long getxId() {
        return xId;
    }

    public void setxId(Long xId) {
        this.xId = xId;
    }
}
