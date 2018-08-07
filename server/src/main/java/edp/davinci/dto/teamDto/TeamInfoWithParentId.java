package edp.davinci.dto.teamDto;


import lombok.Data;

@Data
public class TeamInfoWithParentId {
    private Long id;
    private String name;
    private Long parentId;
}
