package edp.davinci.dto.organizationDto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "Invlaid role")
public class OrganzationRole {

    @Min(value = 0, message = "Invalid role")
    @Max(value = 1, message = "Invalid role")
    private Integer role;
}
