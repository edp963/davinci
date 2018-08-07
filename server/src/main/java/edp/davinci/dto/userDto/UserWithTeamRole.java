package edp.davinci.dto.userDto;

import lombok.Data;

@Data
public class UserWithTeamRole extends UserBaseInfo {
    private Short role;
}
