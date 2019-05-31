package edp.davinci.service.excel;

import edp.davinci.model.Dashboard;
import edp.davinci.model.MemDashboardWidget;
import edp.davinci.model.Widget;

import java.io.Serializable;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/29 11:46
 * To change this template use File | Settings | File Templates.
 */
public class WidgetContext implements Serializable {

    private Widget widget;

    private Dashboard dashboard;

    private MemDashboardWidget memDashboardWidget;

    private Boolean isMaintainer;


    public WidgetContext(Widget widget,Dashboard dashboard,MemDashboardWidget memDashboardWidget){
        this.widget=widget;
        this.dashboard=dashboard;
        this.memDashboardWidget=memDashboardWidget;
    }

    public Widget getWidget() {
        return widget;
    }

    public void setWidget(Widget widget) {
        this.widget = widget;
    }

    public Dashboard getDashboard() {
        return dashboard;
    }

    public void setDashboard(Dashboard dashboard) {
        this.dashboard = dashboard;
    }

    public MemDashboardWidget getMemDashboardWidget() {
        return memDashboardWidget;
    }

    public void setMemDashboardWidget(MemDashboardWidget memDashboardWidget) {
        this.memDashboardWidget = memDashboardWidget;
    }

    public Boolean getMaintainer() {
        return isMaintainer;
    }

    public void setMaintainer(Boolean maintainer) {
        isMaintainer = maintainer;
    }


}
