package edp.davinci.dto.teamDto;

import edp.davinci.dto.userDto.UserBaseInfo;
import lombok.Data;

import java.util.List;

@Data
public class TeamBaseInfoWithParent extends TeamBaseInfo {

    private Long parentTeamId;

    private List<UserBaseInfo> users;
}
