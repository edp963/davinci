package edp.davinci.dto.shareDto;

import edp.davinci.model.MemDashboardWidget;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class ShareDashboard {
    private Long id;

    private String name;

    private String config;

    private Set<ShareWidget> widgets;

    private List<MemDashboardWidget> relations;
}
