package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class Star {
    private Long id;

    private String target;

    private Long targetId;

    private Long userId;

    private Date starTime;
}