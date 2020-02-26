package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class RelRoleUser {
    private Long id;

    private Long userId;

    private Long roleId;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;
}