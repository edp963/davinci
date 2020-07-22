package edp.davinci.server.dto.statistic;

import java.util.Date;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import edp.davinci.server.commons.Constants;
import lombok.Data;

@Data
@NotNull(message = "Duration cannot be null")
public class DavinciStatisticDuration {

	@NotNull
    @Min(value = 1L)
    private Long user_id;

    @NotBlank
    @Pattern(regexp = Constants.REG_EMAIL_FORMAT, message = "Illegal email format")
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
    private Date start_time;

    @NotNull
    private Date end_time;

}
