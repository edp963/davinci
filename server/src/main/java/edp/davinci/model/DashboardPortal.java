package edp.davinci.model;

import lombok.Data;

@Data
public class DashboardPortal {
    private Long id;

    private String name;

    private String description;

    private Long projectId;

    private String avatar;

    private Boolean publish;

}