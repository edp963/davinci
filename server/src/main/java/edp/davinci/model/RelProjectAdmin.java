package edp.davinci.model;

import edp.davinci.common.model.RecordInfo;
import lombok.Data;


@Data
public class RelProjectAdmin extends RecordInfo {
    private Long id;

    private Long projectId;

    private Long userId;
}