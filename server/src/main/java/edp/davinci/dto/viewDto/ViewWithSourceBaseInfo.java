package edp.davinci.dto.viewDto;

import edp.davinci.dto.sourceDto.SourceBaseInfo;
import lombok.Data;

@Data
public class ViewWithSourceBaseInfo {
    private Long id;

    private String name;

    private String description;

    private Long projectId;

    private Long sourceId;

    private String sql;

    private String model;

    private String config;

    private SourceBaseInfo source;
}
