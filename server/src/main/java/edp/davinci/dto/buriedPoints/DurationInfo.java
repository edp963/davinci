package edp.davinci.dto.buriedPoints;

import edp.core.utils.DateUtils;
import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.sql.Timestamp;

@Data
@NotNull(message = "duration info cannot be null")
public class DurationInfo {

    @NotBlank
    @Min(value = 1L)
    private Long user_id;

    @NotBlank
    private String email;

    @NotBlank
    @Pattern(regexp = DateUtils.DATE_HMS_REGEX, message = "Unparseable create_time format")
    private Timestamp start_time;

    @NotBlank
    @Pattern(regexp = DateUtils.DATE_HMS_REGEX, message = "Unparseable end_time format")
    private Timestamp end_time;

}
