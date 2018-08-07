package edp.davinci.dto.viewDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "view cannot be null")
public class ViewUpdate {

    @Min(value = 1L, message = "Invalid view Id")
    private Long id;

    @NotBlank(message = "view name cannot be empty")
    private String name;

    private String description;

    @Min(value = 1L, message = "Invalid source Id")
    private Long sourceId;

    private String sql;

    private String model;

    private String config;
}
