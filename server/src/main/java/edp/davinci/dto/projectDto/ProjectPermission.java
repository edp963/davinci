package edp.davinci.dto.projectDto;

import lombok.Data;

@Data
public class ProjectPermission {

    private Short sourcePermission = 1;

    private Short viewPermission = 1;

    private Short widgetPermission = 1;

    private Short vizPermission = 1;

    private Short schedulePermission = 1;

    private Boolean sharePermission = false;

    private Boolean downloadPermission = false;
}
