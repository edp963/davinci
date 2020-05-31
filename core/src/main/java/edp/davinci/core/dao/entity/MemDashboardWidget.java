package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class MemDashboardWidget {
    private Long id;

    private String alias;

    private Long dashboardId;

    private Long widgetId;

    private Integer x;

    private Integer y;

    private Integer width;

    private Integer height;

    private Boolean polling;

    private Integer frequency;

    private String config;

    private Long createBy;

    private Date createTime;

    private Long updateBy;

    private Date updateTime;
}