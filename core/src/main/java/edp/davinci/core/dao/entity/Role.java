package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class Role {
    private Long id;

    private Long orgId;

    private String name;

    private String description;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;

    private String avatar;
}