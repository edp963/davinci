package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class DavinciStatisticDuration {
    private Long id;

    private Long userId;

    private String email;

    private Date startTime;

    private Date endTime;
}