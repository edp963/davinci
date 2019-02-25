package edp.davinci.model;

import edp.davinci.common.model.RecordInfo;
import lombok.Data;

@Data
public class RelRoleSlide extends RecordInfo {
    private Long id;

    private Long roleId;

    private Long slideId;

    private Short permission = 1;  // 隐藏/只读/修改/删除 0/1/2/3
}