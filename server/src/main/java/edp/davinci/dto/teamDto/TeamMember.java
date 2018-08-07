package edp.davinci.dto.teamDto;

import edp.davinci.dto.userDto.UserWithTeamRole;
import lombok.Data;


@Data
public class TeamMember {
    private Long id;

    private UserWithTeamRole user;

    public TeamMember() {
    }

    public TeamMember(Long id, UserWithTeamRole user) {
        this.id = id;
        this.user = user;
    }
}
