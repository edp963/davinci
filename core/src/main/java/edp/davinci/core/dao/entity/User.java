package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class User {
    private Long id;

    private String email;

    private String username;

    private String password;

    private Boolean admin;

    private Boolean active;

    private String name;

    private String description;

    private String department;

    private String avatar;

    private Date createTime;

    private Long createBy;

    private Date updateTime;

    private Long updateBy;
}