package edp.davinci.dto.teamDto;

import edp.davinci.model.Project;
import lombok.Data;

@Data
public class TeamProject {

    private Long id;

    private Short sourcePermission;

    private Short viewPermission;

    private Short widgetPermission;

    private Short vizPermission;

    private Short schedulePermission;

    private Boolean sharePermission;

    private Boolean downloadPermission;

    private Project project;
}
