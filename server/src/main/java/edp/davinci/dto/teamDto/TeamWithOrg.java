package edp.davinci.dto.teamDto;

import edp.davinci.model.Organization;
import edp.davinci.model.Team;
import lombok.Data;

@Data
public class TeamWithOrg extends Team {

    private Organization organization;
}
