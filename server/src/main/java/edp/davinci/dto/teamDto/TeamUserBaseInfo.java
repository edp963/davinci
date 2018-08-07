package edp.davinci.dto.teamDto;

import edp.davinci.dto.userDto.UserBaseInfo;
import lombok.Data;

@Data
public class TeamUserBaseInfo extends UserBaseInfo {
    private Long teamId;
}
