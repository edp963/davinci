package edp.davinci.dto.displayDto;


import edp.davinci.model.DisplaySlide;
import edp.davinci.model.MemDisplaySlideWidget;
import lombok.Data;

@Data
public class MemDisplaySlideWidgetWithSlide extends MemDisplaySlideWidget {
    private DisplaySlide displaySlide;
}
