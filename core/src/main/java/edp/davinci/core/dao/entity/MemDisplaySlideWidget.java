package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class MemDisplaySlideWidget {
    private Long id;

    private Long displaySlideId;

    private Long widgetId;

    private String name;

    private String params;

    private Short type;

    private Short subType;

    private Integer index;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;
}