package edp.davinci.dto.userDto;


import lombok.Data;

@Data
public class UserWithTeamId extends UserBaseInfo {
    private Long teamId;
}
