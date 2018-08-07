package edp.davinci.dto.teamDto;


import lombok.Data;

@Data
public class TeamParent {
    private Long id;

    private String name;

    private TeamParent child;
}
