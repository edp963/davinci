package edp.davinci.dto.sourceDto;

import edp.davinci.model.Project;
import edp.davinci.model.Source;
import lombok.Data;

@Data
public class SourceWithProject extends Source {
    private Project project;
}
