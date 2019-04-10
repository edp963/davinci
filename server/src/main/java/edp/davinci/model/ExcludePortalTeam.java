package edp.davinci.model;

import lombok.Data;

import java.util.Date;


@Data
public class ExcludePortalTeam {

    private Long id;

    private Long teamId;

    private Long portalId;

    private Long updateBy;

    private Date updateTime = new Date();

    public ExcludePortalTeam(Long teamId, Long portalId, Long updateBy) {
        this.teamId = teamId;
        this.portalId = portalId;
        this.updateBy = updateBy;
    }

    public ExcludePortalTeam() {
    }
}