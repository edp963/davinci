package edp.davinci.core.enums;

public enum UserOrgRoleEnum {

    MEMBER((short) 0, "member"),
    OWNER((short) 1, "owner");

    private short role;
    private String roleName;

    UserOrgRoleEnum(short role, String roleName) {
        this.role = role;
        this.roleName = roleName;
    }

    public static UserOrgRoleEnum roleOf(int role) {
        for (UserOrgRoleEnum userOrgRoleEnum : values()) {
            if ((int) userOrgRoleEnum.getRole() == role) {
                return userOrgRoleEnum;
            }
        }
        return null;
    }

    public short getRole() {
        return role;
    }
}
