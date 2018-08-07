package edp.davinci.dto.viewDto;

import edp.davinci.model.Project;
import edp.davinci.model.Source;
import edp.davinci.model.View;
import lombok.Data;

@Data
public class ViewWithProjectAndSource extends View{

    private Project project;
    private Source source;
}
