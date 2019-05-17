package edp.davinci.model;

import lombok.Data;

import java.util.Date;

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