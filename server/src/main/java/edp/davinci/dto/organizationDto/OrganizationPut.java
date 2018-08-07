package edp.davinci.dto.organizationDto;


import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "organzation info cannot be null")
public class OrganizationPut {

    @Min(value = 1L, message = "Invalid organzation id")
    private Long id;

    @NotBlank(message = "organzation name cannot be empty")
    private String name;

    private String description;

    private String avatar;

    private Boolean allowCreateProject;
}
