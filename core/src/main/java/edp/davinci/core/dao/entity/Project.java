package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class Project {
    private Long id;

    private String name;

    private String description;

    private String pic;

    private Long orgId;

    private Long userId;

    private Boolean visibility;

    private Integer starNum;

    private Boolean isTransfer;

    private Long initialOrgId;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;
}