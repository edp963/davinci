package edp.davinci.dto.teamDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "team info cannot be null")
public class TeamCreate {

    @Min(value = 1L, message = "Invalid orgId")
    private Long orgId;

    @NotBlank(message = "team name cannot be empty")
    private String name;

    @NotBlank(message = "team description cannot be empty")
    private String description;

    private Long parentTeamId;

    private Boolean visibility = true;
}
