package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class DownloadRecord {
    private Long id;

    private String name;

    private Long userId;

    private String path;

    private Short status;

    private Date createTime;

    private Date lastDownloadTime;
}