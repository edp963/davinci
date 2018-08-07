package edp.davinci.dto.displayDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "display info cannot be null")
public class DisplayInfo {

    @NotBlank(message = "display name cannot be empty")
    private String name;

    private String description;

    @Min(value = 1L, message = "Invalid project id")
    private Long projectId;

    private String avatar;

    private Boolean publish = false;
}
