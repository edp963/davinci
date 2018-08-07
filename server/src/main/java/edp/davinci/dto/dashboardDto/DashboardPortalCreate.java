package edp.davinci.dto.dashboardDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "dashboard portal cannot be null")
public class DashboardPortalCreate {

    @NotBlank(message = "dashboard portal cannot be empty")
    private String name;

    private String description;

    @Min(value = 1L, message = "Invalid project id")
    private Long projectId;

    private String avatar;

    private Boolean publish = true;
}
