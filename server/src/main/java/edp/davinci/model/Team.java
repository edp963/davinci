package edp.davinci.model;

import lombok.Data;

@Data
public class Team {
    private Long id;

    private String name;

    private String description;

    private Long orgId;

    private Long parentTeamId;

    private String avatar;

    private Boolean visibility = true;

}