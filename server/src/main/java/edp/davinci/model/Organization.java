package edp.davinci.model;

import lombok.Data;

import java.util.Date;

@Data
public class Organization {
    private Long id;

    private String name;

    private String description;

    private String avatar;

    private Long userId;

    private Integer projectNum = 0;

    private Integer memberNum = 1;

    private Integer teamNum = 0;

    private Boolean allowCreateProject = true;

    private Date createTime = new Date();

    private Long createBy;

    private Date updateTime;

    private Long updateBy;

    public Organization() {
    }

    public Organization(String name, String description, Long userId) {
        this.name = name;
        this.description = description;
        this.userId = userId;
        this.createBy = userId;
    }
}