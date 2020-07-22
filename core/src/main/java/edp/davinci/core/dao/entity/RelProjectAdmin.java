package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class RelProjectAdmin {
    private Long id;

    private Long projectId;

    private Long userId;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;
}