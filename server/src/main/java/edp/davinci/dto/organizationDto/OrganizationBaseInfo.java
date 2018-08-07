package edp.davinci.dto.organizationDto;

import lombok.Data;

@Data
public class OrganizationBaseInfo {
    protected Long id;
    protected String name;
    protected String description;
    protected String avatar;
    protected Short role = 0;


    public OrganizationBaseInfo() {
    }

    public OrganizationBaseInfo(Long id, String name, String description, String avatar, Short role) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.avatar = avatar;
        this.role = role;
    }
}
