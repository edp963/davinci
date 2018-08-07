package edp.davinci.dto.teamDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "project info connot be null")
public class AddProject {

    @Min(value = 1L, message = "Invalid project id")
    private Long projectId;
}
