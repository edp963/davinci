package edp.davinci.service.excel;

import edp.davinci.model.User;

import java.io.Serializable;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/29 19:26
 * To change this template use File | Settings | File Templates.
 */
public class WorkBookContext implements Serializable {

    private MsgWrapper wrapper;

    private List<WidgetContext> widgets;

    private User user;


    public static WorkBookContext newWorkBookContext(MsgWrapper wrapper,List<WidgetContext> widgets,User user){
        return new WorkBookContext(wrapper,widgets,user);
    }

    private WorkBookContext(MsgWrapper wrapper,List<WidgetContext> widgets,User user){
        this.wrapper=wrapper;
        this.widgets=widgets;
        this.user=user;
    }

    public MsgWrapper getWrapper() {
        return wrapper;
    }

    public void setWrapper(MsgWrapper wrapper) {
        this.wrapper = wrapper;
    }

    public List<WidgetContext> getWidgets() {
        return widgets;
    }

    public void setWidgets(List<WidgetContext> widgets) {
        this.widgets = widgets;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
