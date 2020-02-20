package edp.davinci.server.model;

import lombok.Data;

@Data
public class ShareDownloadRecord extends DownloadRecordBaseInfo {

    private Long id;

    private String uuid;

}