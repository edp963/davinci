package edp.davinci.dto.organizationDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "organization transfer info cannot be null")
public class OrganizationTransfer {

    @Min(value = 0L, message = "Invalid organization id")
    private Long orgId;
}
