package edp.davinci.dto.teamDto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "team info cannot be null")
public class TeamPut {
    @NotBlank(message = "team name cannot be empty")
    private String name;

    @NotBlank(message = "team description cannot be empty")
    private String description;

//    private Long parentTeamId;

    private Boolean visibility = true;
}
