package edp.davinci.core.config;

import com.alibaba.fastjson.serializer.SerializerFeature;
import com.alibaba.fastjson.serializer.ValueFilter;
import com.alibaba.fastjson.support.config.FastJsonConfig;
import com.alibaba.fastjson.support.spring.FastJsonHttpMessageConverter;
import edp.core.inteceptor.RequestJsonHandlerArgumentResolver;
import edp.davinci.core.common.Constants;
import edp.davinci.core.inteceptor.AuthenticationInterceptor;
import edp.davinci.core.inteceptor.CurrentUserMethodArgumentResolver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {

    @Value("${file.userfiles-path}")
    private String filePath;

    @Value("${file.web_resources}")
    private String webResources;

    @Bean
    public AuthenticationInterceptor loginRequiredInterceptor() {
        return new AuthenticationInterceptor();
    }

    @Bean
    public CurrentUserMethodArgumentResolver currentUserMethodArgumentResolver() {
        return new CurrentUserMethodArgumentResolver();
    }

    @Bean
    public RequestJsonHandlerArgumentResolver requestJsonHandlerArgumentResolver() {
        return new RequestJsonHandlerArgumentResolver();
    }

    @Override
    protected void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(currentUserMethodArgumentResolver());
        argumentResolvers.add(requestJsonHandlerArgumentResolver());
        super.addArgumentResolvers(argumentResolvers);
    }

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginRequiredInterceptor())
                .addPathPatterns(Constants.BASE_API_PATH + "/**")
                .excludePathPatterns(Constants.BASE_API_PATH + "/login");

        super.addInterceptors(registry);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/META-INF/resources/")
                .addResourceLocations("classpath:/META-INF/resources/webjars")
                .addResourceLocations("classpath:/static/")
                .addResourceLocations("classpath:/static/page/")
                .addResourceLocations("classpath:/static/templates/")
                .addResourceLocations("file:" + webResources)
                .addResourceLocations("file:" + filePath);

    }


    @Override
    protected void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        FastJsonHttpMessageConverter fastConverter = new FastJsonHttpMessageConverter();
        FastJsonConfig fastJsonConfig = new FastJsonConfig();
        fastJsonConfig.setSerializerFeatures(SerializerFeature.QuoteFieldNames,
                SerializerFeature.WriteEnumUsingToString,
                SerializerFeature.WriteMapNullValue,
                SerializerFeature.WriteDateUseDateFormat,
                SerializerFeature.DisableCircularReferenceDetect);
        fastJsonConfig.setSerializeFilters((ValueFilter) (o, s, source) -> {
            if (null == source) {
                return "";
            }
            return source;
        });
        //处理中文乱码问题
        List<MediaType> fastMediaTypes = new ArrayList<>();
        fastMediaTypes.add(MediaType.APPLICATION_JSON_UTF8);
        fastConverter.setSupportedMediaTypes(fastMediaTypes);
        fastConverter.setFastJsonConfig(fastJsonConfig);
        converters.add(fastConverter);
    }
}
