package edp.davinci.dto.viewDto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class Aggregator {

    @NotBlank(message = "Invalid aggregator column")
    private String column;

    private String func;
}
