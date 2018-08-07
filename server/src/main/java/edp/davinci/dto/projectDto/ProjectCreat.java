package edp.davinci.dto.projectDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "project info cannot be null")
public class ProjectCreat {

    @NotBlank(message = "project name cannot be empty")
    private String name;

    @NotBlank(message = "project description cannot be empty")
    private String description;

    private String pic;

    @Min(value = 1L, message = "orgId cannot be empty")
    private Long orgId;

    @Override
    public String toString() {
        return "ProjectCreat{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", pic='" + pic + '\'' +
                ", orgId=" + orgId +
                '}';
    }
}
