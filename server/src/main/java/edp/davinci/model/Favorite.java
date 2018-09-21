package edp.davinci.model;

import lombok.Data;

import java.util.Date;

@Data
public class Favorite {
    private Long id;

    private Long userId;

    private Long projectId;

    private Date createTime;

    public Favorite() {
    }

    public Favorite(Long userId, Long projectId) {
        this.userId = userId;
        this.projectId = projectId;
        this.createTime = new Date();
    }
}