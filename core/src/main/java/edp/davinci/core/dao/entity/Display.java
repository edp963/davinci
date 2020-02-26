package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class Display {
    private Long id;

    private String name;

    private String description;

    private Long projectId;

    private String avatar;

    private Boolean publish;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;

    private String config;
}