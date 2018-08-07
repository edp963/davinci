package edp.davinci.dto.teamDto;

import lombok.Data;

@Data
public class TeamBaseInfo {
    Long id;

    String name;

    String description;

    Boolean visibility;
}
