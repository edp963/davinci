package edp.davinci.model;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class View {

    private Long id;

    private String name;

    private String description;

    private Long projectId;

    private Long sourceId;

    private String sql;

    private String model;

    private String config;
}