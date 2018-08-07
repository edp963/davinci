package edp.davinci.dto.userDto;

import edp.davinci.dto.organizationDto.OrganizationInfo;
import lombok.Data;

import java.util.List;

@Data
public class UserProfile extends UserBaseInfo {
    private String name;
    private String description;
    private String department;

    private List<OrganizationInfo> organizations;
}
