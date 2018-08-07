package edp.davinci.dto.organizationDto;

import edp.davinci.dto.userDto.UserWithOrgRole;
import lombok.Data;

@Data
public class OrganizationMember {

    /**
     * 关联id
     */
    private Long id;
    private Integer teamNum;

    /**
     * 复合属性
     */
    private UserWithOrgRole user;
}
