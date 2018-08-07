package edp.davinci.dto.organizationDto;

import lombok.Data;

@Data
public class OrganizationProjectBaseInfo {
    private Long id;
    private String name;
    private String description;
    private Long createBy;
}
