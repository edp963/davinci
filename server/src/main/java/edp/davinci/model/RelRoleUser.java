package edp.davinci.model;

import edp.davinci.common.model.RecordInfo;
import lombok.Data;

@Data
public class RelRoleUser extends RecordInfo<RelRoleUser> {
    private Long id;

    private Long userId;

    private Long roleId;

    public RelRoleUser(Long userId, Long roleId) {
        this.userId = userId;
        this.roleId = roleId;
    }

    public RelRoleUser() {
    }

    @Override
    public String toString() {
        return "RelRoleUser{" +
                "id=" + id +
                ", userId=" + userId +
                ", roleId=" + roleId +
                '}';
    }
}