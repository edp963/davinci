package edp.davinci.dto.teamDto;

import edp.davinci.dto.organizationDto.OrganizationBaseInfo;
import lombok.Data;

@Data
public class MyTeam extends TeamBaseInfo {

    private String avatar;

    private Short role;

    private OrganizationBaseInfo organization;
}
