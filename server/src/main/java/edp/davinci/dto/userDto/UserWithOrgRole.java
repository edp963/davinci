package edp.davinci.dto.userDto;

import lombok.Data;

@Data
public class UserWithOrgRole extends UserBaseInfo {
    private Short role;
}
