package edp.davinci.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import springfox.documentation.annotations.ApiIgnore;

@ApiIgnore
@Controller
@Slf4j
public class HomeController {

    @RequestMapping("swagger")
    public String swagger() {
        return "redirect:swagger-ui.html";
    }

    @RequestMapping(value = {"", "/"})
    public String index() {
        return "index";
    }

    @RequestMapping("share")
    public String shareIndex() {
        return "share";
    }
}
