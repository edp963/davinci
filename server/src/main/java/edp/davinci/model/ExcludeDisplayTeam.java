package edp.davinci.model;

import lombok.Data;

import java.util.Date;

@Data
public class ExcludeDisplayTeam {

    private Long id;

    private Long teamId;

    private Long displayId;

    private Long updateBy;

    private Date updateTime = new Date();

    public ExcludeDisplayTeam(Long teamId, Long displayId, Long updateBy) {
        this.teamId = teamId;
        this.displayId = displayId;
        this.updateBy = updateBy;
    }

    public ExcludeDisplayTeam() {
    }
}