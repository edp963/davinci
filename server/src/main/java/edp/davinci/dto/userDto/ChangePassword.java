package edp.davinci.dto.userDto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "Invalid password")
public class ChangePassword {

    @NotBlank(message = "password cannot be empty")
    private String oldPassword;

    @NotBlank(message = "new password cannot be empty")
    private String password;
}
