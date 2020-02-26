package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class Favorite {
    private Long id;

    private Long userId;

    private Long projectId;

    private Date createTime;
}