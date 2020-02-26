package edp.davinci.server.dto.statistic;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import edp.davinci.server.commons.Constants;

import java.time.LocalDateTime;

@Data
@NotNull(message = "terminal info cannot be null")
public class DavinciStatisticTerminalInfo {

    @NotNull
    @Min(value = 1L)
    private Long user_id;

    @NotBlank
    @Pattern(regexp = Constants.REG_EMAIL_FORMAT, message = "Illegal email format")
    private String email ;

    private String browser_name ;

    private String browser_version ;

    private String engine_name ;

    private String engine_version ;

    private String os_name ;

    private String os_version ;

    private String device_model ;

    private String device_type ;

    private String device_vendor ;

    private String cpu_architecture;

    @NotNull
    private LocalDateTime create_time;
    
}