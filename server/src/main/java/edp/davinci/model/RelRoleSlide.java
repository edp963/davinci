package edp.davinci.model;

import edp.davinci.common.model.RecordInfo;
import lombok.Data;

@Data
public class RelRoleSlide extends RecordInfo<RelRoleSlide> {
    private Long id;

    private Long roleId;

    private Long slideId;

    private Boolean visiable = false; // 可见/不可见  true/false
}