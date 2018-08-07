package edp.davinci.dto.userDto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class UserLogin {

    @NotBlank(message = "username cannot be empty")
    private String username;

    @NotBlank(message = "password cannot be empty")
    private String password;
}
