package edp.davinci.core.enums;

public enum UserPermissionEnum {

    HIDDEN((short) 0, "hidden"),
    READ((short) 1, "read only"),
    WRITE((short) 2, "write"),
    DELETE((short) 3, "delete");


    private short permission;
    private String permissionName;

    UserPermissionEnum(short permission, String permissionName) {
        this.permission = permission;
        this.permissionName = permissionName;
    }

    public static UserPermissionEnum permissionOf(int permission) {
        for (UserPermissionEnum userPermissionEnum : values()) {
            if ((int) userPermissionEnum.getPermission() == permission) {
                return userPermissionEnum;
            }
        }
        return null;
    }

    public short getPermission() {
        return permission;
    }
}
