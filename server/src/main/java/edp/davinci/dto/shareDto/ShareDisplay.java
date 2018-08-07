package edp.davinci.dto.shareDto;

import lombok.Data;

import java.util.Set;

@Data
public class ShareDisplay {
    private Long id;
    private String name;
    private String description;
    private Set<ShareDisplaySlide> slides;
    private Set<ShareWidget> widgets;
}
