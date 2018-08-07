package edp.davinci.core.enums;


public enum UserTeamRoleEnum {

    MEMBER((short) 0, "member"),
    MAINTAINER((short) 1, "maintainer");

    private short role;
    private String roleName;

    UserTeamRoleEnum(short role, String roleName) {
        this.role = role;
        this.roleName = roleName;
    }

    public short getRole() {
        return role;
    }


    public static UserTeamRoleEnum roleOf(int role) {
        for (UserTeamRoleEnum userTeamRoleEnum : values()) {
            if ((int) userTeamRoleEnum.role == role) {
                return userTeamRoleEnum;
            }
        }
        return null;
    }
}
