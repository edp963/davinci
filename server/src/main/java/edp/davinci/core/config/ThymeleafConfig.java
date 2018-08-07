package edp.davinci.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.spring5.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.FileTemplateResolver;

import javax.annotation.PostConstruct;

@Configuration
public class ThymeleafConfig {


    @Autowired
    private SpringTemplateEngine templateEngine;

    @Value("${file.web_resources}")
    private String webResources;


    @PostConstruct
    public void webResourcesResolver() {
        FileTemplateResolver resolver = new FileTemplateResolver();
        resolver.setPrefix(webResources);
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setOrder(templateEngine.getTemplateResolvers().size());
        resolver.setCacheable(false);

        templateEngine.addTemplateResolver(resolver);

    }
}
