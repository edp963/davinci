package edp.davinci.dto.displayDto;

import edp.davinci.model.Display;
import lombok.Data;

import java.util.List;

@Data
public class DisplayWithSlides extends Display {

    private List<DisplaySlideInfo> slides;
}
