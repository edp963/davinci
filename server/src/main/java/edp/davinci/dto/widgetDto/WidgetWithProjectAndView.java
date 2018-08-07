package edp.davinci.dto.widgetDto;

import edp.davinci.model.Project;
import edp.davinci.model.View;
import edp.davinci.model.Widget;
import lombok.Data;

@Data
public class WidgetWithProjectAndView extends Widget {
    private Project project;
    private View view;
}
