package edp.davinci.server.model;

import edp.davinci.core.dao.entity.DownloadRecord;
import lombok.Data;

@Data
public class ShareDownloadRecord extends DownloadRecord {

    private Long id;

    private String uuid;

}