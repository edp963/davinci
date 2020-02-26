package edp.davinci.core.dao.entity;

import lombok.Data;

@Data
public class RelUserOrganization {
    private Long id;

    private Long orgId;

    private Long userId;

    private Short role;
}