package edp.davinci.dto.projectDto;

import lombok.Data;

@Data
public class ProjectInfo {
    private Long id;

    private String name;

    private String description;

    private String pic;

    private Long orgId;

    private Boolean visibility;

    private ProjectPermission permission = new ProjectPermission();

    private Long createBy;
}
