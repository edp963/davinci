package edp.davinci.dto.organizationDto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "organzation info cannot be null")
public class OrganizationCreate {
    @NotBlank(message = "organzation name cannot be empty")
    private String name;

    @NotBlank(message = "organzation description cannot be empty")
    private String description;

    @Override
    public String toString() {
        return "OrganizationCreate{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
