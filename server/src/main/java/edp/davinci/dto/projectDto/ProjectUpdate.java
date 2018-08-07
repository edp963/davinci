package edp.davinci.dto.projectDto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "project cannot be null")
public class ProjectUpdate {

    @NotBlank(message = "project name cannot be empty")
    private String name;

    @NotBlank(message = "project description cannot be empty")
    private String description;

    private Boolean visibility = true;
}
