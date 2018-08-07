package edp.davinci.dto.displayDto;

import edp.davinci.model.Display;
import edp.davinci.model.Project;
import lombok.Data;

@Data
public class DisplayWithProject extends Display {

    private Project project;
}
