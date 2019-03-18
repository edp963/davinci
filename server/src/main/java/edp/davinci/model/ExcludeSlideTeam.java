package edp.davinci.model;

import lombok.Data;

import java.util.Date;

@Data
public class ExcludeSlideTeam {

    private Long id;

    private Long teamId;

    private Long slideId;

    private Long updateBy;

    private Date updateTime = new Date();

    public ExcludeSlideTeam(Long teamId, Long slideId, Long updateBy) {
        this.teamId = teamId;
        this.slideId = slideId;
        this.updateBy = updateBy;
    }

    public ExcludeSlideTeam() {
    }
}