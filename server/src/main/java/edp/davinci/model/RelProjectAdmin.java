package edp.davinci.model;

import edp.davinci.common.model.RecordInfo;
import lombok.Data;


@Data
public class RelProjectAdmin extends RecordInfo<RelProjectAdmin> {
    private Long id;

    private Long projectId;

    private Long userId;


    public RelProjectAdmin(Long projectId, Long userId) {
        this.projectId = projectId;
        this.userId = userId;
    }

    public RelProjectAdmin() {
    }

    @Override
    public String toString() {
        return "RelProjectAdmin{" +
                "id=" + id +
                ", projectId=" + projectId +
                ", userId=" + userId +
                '}';
    }
}