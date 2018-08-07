package edp.davinci.dto.userDto;

import edp.davinci.core.common.Constants;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@Data
@NotNull(message = "email address cannot be null")
public class SendMail {

    @NotBlank(message = "email address cannote be empty")
    @Pattern(regexp = Constants.REG_EMAIL_FORMAT, message = "invalid email format")
    private String email;
}
