package edp.davinci.model;

import edp.davinci.common.model.RecordInfo;
import lombok.Data;

@Data
public class RelRoleUser extends RecordInfo {
    private Long id;

    private Long userId;

    private Long roleId;
}