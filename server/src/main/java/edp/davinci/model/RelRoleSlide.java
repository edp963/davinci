package edp.davinci.model;

import edp.davinci.common.model.RecordInfo;
import lombok.Data;

@Data
public class RelRoleSlide extends RecordInfo<RelRoleSlide> {
    private Long id;

    private Long roleId;

    private Long slideId;

    private Boolean visible = false; // 可见/不可见  true/false


    public RelRoleSlide(Long slideId, Long roleId) {
        this.roleId = roleId;
        this.slideId = slideId;
    }

    public RelRoleSlide() {
    }
}