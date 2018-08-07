package edp.davinci.dto.userDto;

import edp.davinci.core.common.Constants;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@Data
@NotNull(message = "user info cannot be null")
public class UserRegist {
    @NotBlank(message = "username cannot be empty")
    private String username;

    @NotBlank(message = "email cannot be empty")
    @Pattern(regexp = Constants.REG_EMAIL_FORMAT, message = "invalid email format")
    private String email;

    @NotBlank(message = "password cannot be empty")
    private String password;

    @Override
    public String toString() {
        return "UserRegist{" +
                "username='" + username + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
