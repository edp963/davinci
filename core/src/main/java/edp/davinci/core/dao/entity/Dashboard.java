package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class Dashboard {
    private Long id;

    private String name;

    private Long dashboardPortalId;

    private Short type;

    private Integer index;

    private Long parentId;

    private String fullParentId;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;

    private String config;
}