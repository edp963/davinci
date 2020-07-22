package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class Widget {
    private Long id;

    private String name;

    private String description;

    private Long viewId;

    private Long projectId;

    private Long type;

    private Boolean publish;

    private String config;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;

    private Long parentId;

    private String fullParentId;

    private Boolean isFolder;

    private Integer index;
}