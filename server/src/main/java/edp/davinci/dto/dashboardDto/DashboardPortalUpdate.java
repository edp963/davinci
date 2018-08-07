package edp.davinci.dto.dashboardDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "dashboard portal cannot be null")
public class DashboardPortalUpdate {

    @Min(value = 1L, message = "Invalid id")
    private Long id;

    @NotBlank(message = "dashboard portal name cannot be empty")
    private String name;

    private String description;

    private String avatar;

    private Boolean publish = true;
}
