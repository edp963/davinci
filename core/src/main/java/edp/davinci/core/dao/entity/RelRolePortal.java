package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class RelRolePortal {
    private Long roleId;

    private Long portalId;

    private Boolean visible;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;
}