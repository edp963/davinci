package edp.davinci.core.enums;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 10:57
 * To change this template use File | Settings | File Templates.
 */
public enum DownloadType {
    Widget("widget"),
    DashBoard("dashboard"),
    DashBoardFolder("folder");

    private String type;

    private DownloadType(String type){
        this.type=type;
    }

    public static DownloadType getDownloadType(String type){
        for(DownloadType em:DownloadType.values()){
            if(em.type.equalsIgnoreCase(type)){
                return em;
            }
        }
        return null;
    }
}
