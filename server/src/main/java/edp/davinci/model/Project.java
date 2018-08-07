package edp.davinci.model;

import lombok.Data;

@Data
public class Project {
    private Long id;

    private String name;

    private String description;

    private String pic;

    private Long orgId;

    private Long userId;

    private Boolean visibility = true;

    public Project() {
    }

    public Project(Long id, Long userId) {
        this.id = id;
        this.userId = userId;
    }

    @Override
    public String toString() {
        return "Project{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", pic='" + pic + '\'' +
                ", orgId=" + orgId +
                ", userId=" + userId +
                ", visibility=" + visibility +
                '}';
    }
}