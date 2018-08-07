package edp.davinci.dto.organizationDto;

import lombok.Data;

@Data
public class OrganizationInfo extends OrganizationBaseInfo {

    private Integer projectNum;

    private Integer memberNum;

    private Integer teamNum;

    private Boolean allowCreateProject;
}
