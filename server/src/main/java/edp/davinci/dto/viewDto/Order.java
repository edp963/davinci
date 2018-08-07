package edp.davinci.dto.viewDto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class Order {
    @NotBlank(message = "Invalid order column")
    private String column;

    private String direction = "ASC";
}
