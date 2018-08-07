package edp.davinci.dto.displayDto;

import edp.davinci.model.Display;
import edp.davinci.model.DisplaySlide;
import edp.davinci.model.Project;
import lombok.Data;

@Data
public class SlideWithDisplayAndProject extends DisplaySlide {

    private Display display;

    private Project project;
}
