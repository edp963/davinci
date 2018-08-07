package edp.davinci.dto.dashboardDto;

import lombok.Data;

import javax.validation.constraints.Min;

@Data
public class MemDashboardWidgetCreate {

    @Min(value = 1L, message = "Invalid dashboard id")
    private Long dashboardId;

    @Min(value = 1L, message = "Invalid widget id")
    private Long widgetId;

    private Integer x;

    private Integer y;

    @Min(value = 0, message = "Invalid width")
    private Integer width;

    @Min(value = 0, message = "Invalid heidget")
    private Integer height;

    private Boolean polling = false;

    private Integer frequency;
}
