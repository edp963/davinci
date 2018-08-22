package edp.davinci.dto.viewDto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
@NotNull(message = "request parameter cannot be null")
public class DistinctParam {
    @NotBlank(message = "distinct column cannot be empty")
    private String column;

    private List<WhereParam> parents;
}
