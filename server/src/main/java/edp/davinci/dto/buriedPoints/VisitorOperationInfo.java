package edp.davinci.dto.buriedPoints;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.sql.Timestamp;

@Data
@NotNull(message = "visitor operation info cannot be null")
public class VisitorOperationInfo {

    @NotNull
    @Min(value = 1L)
    private Long user_id;

    @NotBlank
    private String email;

    @NotBlank
    private String action;

    @Min(value = 1L)
    private Long org_id;

    @Min(value = 1L)
    private Long project_id;

    private String project_name;

    private String viz_type;

    @Min(value = 1L)
    private Long viz_id;

    private String viz_name;

    @Min(value = 1L)
    private Long sub_viz_id;

    private String sub_viz_name;

    @NotNull
    private Timestamp create_time;

}

