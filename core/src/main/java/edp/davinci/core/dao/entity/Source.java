package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class Source {
    private Long id;

    private String name;

    private String description;

    private String type;

    private Long projectId;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;

    private Long parentId;

    private String fullParentId;

    private Boolean isFolder;

    private Integer index;

    private String config;
}