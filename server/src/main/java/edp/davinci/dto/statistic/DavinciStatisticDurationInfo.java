package edp.davinci.dto.statistic;

import edp.core.consts.Consts;
import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.time.LocalDateTime;

@Data
@NotNull(message = "duration info cannot be null")
public class DavinciStatisticDurationInfo {

    @NotNull
    @Min(value = 1L)
    private Long user_id;

    @NotBlank
    @Pattern(regexp = Consts.REG_EMAIL_FORMAT, message = "Illegal email format")
    private String email;

    private Long org_id;

    private Long project_id;

    private String project_name;

    private String viz_type;

    private Long viz_id;

    private String viz_name;

    private Long sub_viz_id;

    private String sub_viz_name;

    @NotNull
    private LocalDateTime start_time;

    @NotNull
    private LocalDateTime end_time;

}
