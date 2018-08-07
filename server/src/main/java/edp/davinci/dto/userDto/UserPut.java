package edp.davinci.dto.userDto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
@NotNull
public class UserPut {
    private String name;
    private String description;
    private String department;
}
