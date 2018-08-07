package edp.davinci.dto.widgetDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@NotNull(message = "widget cannot be null")
@Data
public class WidgetUpdate {

    @Min(value = 1L, message = "Invalid id")
    private Long id;

    @NotBlank(message = "widget name cannot be empty")
    private String name;

    private String description;

    @Min(value = 1L, message = "Invalid view id")
    private Long viewId;

    @Min(value = 1L, message = "Invalid type")
    private Long type;

    private Boolean publish = false;

    private String config;
}
