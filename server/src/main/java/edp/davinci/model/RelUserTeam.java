package edp.davinci.model;

import lombok.Data;

@Data
public class RelUserTeam {
    private Long id;

    private Long teamId;

    private Long userId;

    private Short role = 0;

    public RelUserTeam() {
    }

    public RelUserTeam(Long teamId, Long userId, Short role) {
        this.teamId = teamId;
        this.userId = userId;
        this.role = role;
    }
}