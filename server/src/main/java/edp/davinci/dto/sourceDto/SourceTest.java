package edp.davinci.dto.sourceDto;


import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class SourceTest {

    @NotBlank(message = "connection username cannot be empty")
    private String username;
    private String password;

    @NotBlank(message = "connection url cannot be empty")
    private String url;
}
