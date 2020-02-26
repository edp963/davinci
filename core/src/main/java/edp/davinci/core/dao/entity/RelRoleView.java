package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class RelRoleView {
    private Long viewId;

    private Long roleId;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;

    private String rowAuth;

    private String columnAuth;
}