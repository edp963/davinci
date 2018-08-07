package edp.davinci.dto.userDto;

import lombok.Data;

@Data
public class UserLoginResult extends UserBaseInfo {

    private String email;

    private Boolean admin;

    private String name;

    private String description;

    private String department;

}