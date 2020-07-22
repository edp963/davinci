package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class RelRoleProject {
    private Long id;

    private Long projectId;

    private Long roleId;

    private Short sourcePermission;

    private Short viewPermission;

    private Short widgetPermission;

    private Short vizPermission;

    private Short schedulePermission;

    private Boolean sharePermission;

    private Boolean downloadPermission;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;
}