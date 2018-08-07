package edp.davinci.dto.viewDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

@Data
public class ViewExecuteSql {
    @Min(value = 1L, message = "Invalid Source Id")
    private Long sourceId;

    @NotBlank(message = "sql cannot be empty")
    private String sql;
}
