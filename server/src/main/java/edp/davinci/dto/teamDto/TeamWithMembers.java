package edp.davinci.dto.teamDto;

import edp.davinci.dto.userDto.UserBaseInfo;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TeamWithMembers extends TeamBaseInfo {

    private List<UserBaseInfo> users;

    private List<TeamWithMembers> children = new ArrayList<>();
}
