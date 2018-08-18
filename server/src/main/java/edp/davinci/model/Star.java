package edp.davinci.model;

import lombok.Data;

import java.util.Date;

@Data
public class Star {
    private Long id;

    private String target;

    private Long targetId;

    private Long userId;

    private Date starTime;


    public Star() {
    }

    public Star(String target, Long targetId, Long userId) {
        this.target = target;
        this.targetId = targetId;
        this.userId = userId;
        this.starTime = new Date();
    }
}