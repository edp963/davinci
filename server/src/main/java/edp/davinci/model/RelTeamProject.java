package edp.davinci.model;

import lombok.Data;

@Data
public class RelTeamProject {
    private Long id;

    private Long teamId;

    private Long projectId;

    private Short sourcePermission = 1;

    private Short viewPermission = 1;

    private Short widgetPermission = 1;

    private Short vizPermission = 1;

    private Short schedulePermission = 1;

    private Boolean sharePermission = false;

    private Boolean downloadPermission = false;

    public RelTeamProject() {
    }

    public RelTeamProject(Long teamId, Long projectId) {
        this.teamId = teamId;
        this.projectId = projectId;
    }
}