package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class View {
    private Long id;

    private String name;

    private String description;

    private Long projectId;

    private Long sourceId;

    private String sql;

    private String model;

    private String variable;

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