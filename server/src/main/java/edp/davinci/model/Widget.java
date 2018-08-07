package edp.davinci.model;

import lombok.Data;

@Data
public class Widget {
    private Long id;

    private String name;

    private String description;

    private Long viewId;

    private Long projectId;

    private Long type;

    private Boolean publish = false;

    private String config;

}