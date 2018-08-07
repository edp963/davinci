package edp.davinci.dto.shareDto;

import edp.davinci.model.MemDisplaySlideWidget;
import lombok.Data;

import java.util.Set;

@Data
public class ShareDisplaySlide {
    private Long displayId;

    private Integer index;

    private String config;

    private Set<MemDisplaySlideWidget> relations;
}
