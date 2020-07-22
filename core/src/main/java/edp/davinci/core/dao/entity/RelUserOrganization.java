package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class RelUserOrganization {
    private Long id;

    private Long orgId;

    private Long userId;

    private Short role;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;
}