package edp.davinci.dto.displayDto;


import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "display slide widget info cannot be null")
public class MemDisplaySlideWidgetCreate {

    @NotBlank(message = "name cannot be empty")
    private String name;

    @Min(value = 1L, message = "Invalid display slide id")
    private Long displaySlideId;

    private Long widgetId;

    @Min(value = 0, message = "Invalid type")
    private Short type;

    private Short subType;

    private Integer index = 0;

    @NotBlank(message = "type cannot be empty")
    private String params;
}
