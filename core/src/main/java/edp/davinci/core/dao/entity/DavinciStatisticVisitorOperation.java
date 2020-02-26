package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class DavinciStatisticVisitorOperation {
    private Long id;

    private Long userId;

    private String email;

    private String action;

    private Long orgId;

    private Long projectId;

    private String projectName;

    private String vizType;

    private Long vizId;

    private String vizName;

    private Long subVizId;

    private String subVizName;

    private Long widgetId;

    private String widgetName;

    private String variables;

    private String filters;

    private String groups;

    private Date createTime;
}