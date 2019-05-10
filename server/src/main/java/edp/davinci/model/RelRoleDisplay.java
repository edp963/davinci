package edp.davinci.model;

import edp.davinci.common.model.RecordInfo;
import lombok.Data;

@Data
public class RelRoleDisplay extends RecordInfo<RelRoleDisplay> {
    private Long id;

    private Long roleId;

    private Long displayId;

    private Boolean visible = false; // 可见/不可见  true/false

    public RelRoleDisplay(Long displayId, Long roleId) {
        this.roleId = roleId;
        this.displayId = displayId;
    }

    public RelRoleDisplay() {
    }
}