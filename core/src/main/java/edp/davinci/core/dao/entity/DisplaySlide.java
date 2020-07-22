package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class DisplaySlide {
    private Long id;

    private Long displayId;

    private Integer index;

    private String config;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;
}