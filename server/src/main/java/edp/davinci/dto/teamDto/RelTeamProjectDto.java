package edp.davinci.dto.teamDto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Data
@NotNull
public class RelTeamProjectDto {

    @Min(value = (short) 0 ,message = "Invalid source permission")
    @Max(value = (short) 3, message = "Invalid source permission")
    private Short sourcePermission;

    @Min(value = (short) 0 ,message = "Invalid view permission")
    @Max(value = (short) 3, message = "Invalid view permission")
    private Short viewPermission;

    @Min(value = (short) 0 ,message = "Invalid widget permission")
    @Max(value = (short) 3, message = "Invalid widget permission")
    private Short widgetPermission;

    @Min(value = (short) 0 ,message = "Invalid viz permission")
    @Max(value = (short) 3, message = "Invalid viz permission")
    private Short vizPermission;

    @Min(value = (short) 0 ,message = "Invalid schedule permission")
    @Max(value = (short) 3, message = "Invalid schedule permission")
    private Short schedulePermission;

    private Boolean sharePermission;

    private Boolean downloadPermission;
}
