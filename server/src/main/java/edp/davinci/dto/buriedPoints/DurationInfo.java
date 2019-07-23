package edp.davinci.dto.buriedPoints;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.sql.Timestamp;

@Data
@NotNull(message = "duration info cannot be null")
public class DurationInfo {

    @NotNull
    @Min(value = 1L)
    private Long user_id;

    @NotBlank
    private String email;

    @NotNull
    private Timestamp start_time;

    @NotNull
    private Timestamp end_time;

}
