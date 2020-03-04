package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class Organization {
    private Long id;

    private String name;

    private String description;

    private String avatar;

    private Long userId;

    private Integer projectNum;

    private Integer memberNum;

    private Integer roleNum;

    private Boolean allowCreateProject;

    private Short memberPermission;

    private Date createTime;

    private Long createBy;

    private Date updateTime;

    private Long updateBy;
}