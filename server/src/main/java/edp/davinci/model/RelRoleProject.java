package edp.davinci.model;

import edp.davinci.common.model.RecordInfo;
import lombok.Data;

@Data
public class RelRoleProject extends RecordInfo<RelRoleProject> {
    private Long id;

    private Long projectId;

    private Long roleId;

    private Short sourcePermission = 1;     //隐藏/只读/修改/删除 0/1/2/3
    private Short viewPermission = 1;       //隐藏/只读/修改/删除 0/1/2/3
    private Short widgetPermission = 1;     //隐藏/只读/修改/删除 0/1/2/3
    private Short vizPermission = 1;        //隐藏/只读/修改/删除 0/1/2/3
    private Short schedulePermission = 1;   //隐藏/只读/修改/删除 0/1/2/3

    private Boolean sharePermission = false;
    private Boolean downloadPermission = false;


    public RelRoleProject(Long projectId, Long roleId) {
        this.projectId = projectId;
        this.roleId = roleId;
    }

    public RelRoleProject() {
    }

    @Override
    public String toString() {
        return "RelRoleProject{" +
                "id=" + id +
                ", projectId=" + projectId +
                ", roleId=" + roleId +
                ", sourcePermission=" + sourcePermission +
                ", viewPermission=" + viewPermission +
                ", widgetPermission=" + widgetPermission +
                ", vizPermission=" + vizPermission +
                ", schedulePermission=" + schedulePermission +
                ", sharePermission=" + sharePermission +
                ", downloadPermission=" + downloadPermission +
                '}';
    }
}