package edp.davinci.core.dao.entity;

import java.util.Date;
import lombok.Data;

@Data
public class ShareDownloadRecord {
    private Long id;

    private String uuid;

    private String name;

    private String path;

    private Short status;

    private Date createTime;

    private Date lastDownloadTime;
}