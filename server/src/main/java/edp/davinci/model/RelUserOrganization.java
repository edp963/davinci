package edp.davinci.model;

import lombok.Data;

@Data
public class RelUserOrganization {
    private Long id;

    private Long orgId;

    private Long userId;

    private Short role = 0;

    public RelUserOrganization() {
    }

    public RelUserOrganization(Long orgId, Long userId, Short role) {
        this.orgId = orgId;
        this.userId = userId;
        this.role = role;
    }
}