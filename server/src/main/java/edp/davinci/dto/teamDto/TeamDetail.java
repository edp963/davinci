package edp.davinci.dto.teamDto;

import lombok.Data;

@Data
public class TeamDetail extends TeamBaseInfo {
    private String avatar;

    private TeamOrgBaseInfo organization;

    private Long parentTeamId;

    private TeamParent parents;

    private Short role = 0;
}
