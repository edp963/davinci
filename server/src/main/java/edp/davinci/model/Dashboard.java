package edp.davinci.model;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "dashboard cannot be null")
public class Dashboard {

    @Min(value = 1L, message = "Invalid dashboard id")
    private Long id;

    @NotBlank(message = "dashboard name cannot be empty")
    private String name;

    @Min(value = 1L, message = "Invalid dashboard portal id")
    private Long dashboardPortalId;

    @Min(value = (short) 0, message = "Invalid dashboard type")
    @Max(value = (short) 1, message = "Invalid dashboard type")
    private Short type;

    private Integer index = 0;

    private Long parentId;

    private String config;

}