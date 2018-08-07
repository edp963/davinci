package edp.davinci.model;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "display info cannot be null")
public class Display {
    @Min(value = 1L, message = "Invalid display id")
    private Long id;

    @NotBlank(message = "display name cannot be empty")
    private String name;

    private String description;

    @Min(value = 1L, message = "project id cannot be empty")
    private Long projectId;

    private String avatar;

    private Boolean publish = false;
}