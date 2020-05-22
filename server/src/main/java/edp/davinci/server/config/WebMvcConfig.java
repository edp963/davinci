/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
 *  ==
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *        http://www.apache.org/licenses/LICENSE-2.0
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *  >>
 *
 */

package edp.davinci.server.config;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser.Feature;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.SerializerProvider;

import edp.davinci.server.commons.Constants;
import edp.davinci.server.inteceptor.AuthenticationInterceptor;
import edp.davinci.server.inteceptor.CurrentPlatformMethodArgumentResolver;
import edp.davinci.server.inteceptor.CurrentUserMethodArgumentResolver;
import edp.davinci.server.inteceptor.PlatformAuthInterceptor;

import static edp.davinci.commons.Constants.*;

@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {

    @Value("${file.userfiles-path}")
    private String filePath;

    @Value("${file.web_resources}")
    private String webResources;

    /**
     * 登录校验拦截器
     *
     * @return
     */
    @Bean
    public AuthenticationInterceptor loginRequiredInterceptor() {
        return new AuthenticationInterceptor();
    }

    /**
     * 授权平台校验拦截器
     *
     * @return
     */
    @Bean
    public PlatformAuthInterceptor platformAuthInterceptor() {
        return new PlatformAuthInterceptor();
    }

    /**
     * CurrentUser 注解参数解析器
     *
     * @return
     */
    @Bean
    public CurrentUserMethodArgumentResolver currentUserMethodArgumentResolver() {
        return new CurrentUserMethodArgumentResolver();
    }

    /**
     * CurrentPlatform 注解参数解析器
     *
     * @return
     */
    @Bean
    public CurrentPlatformMethodArgumentResolver currentPlatformMethodArgumentResolver() {
        return new CurrentPlatformMethodArgumentResolver();
    }

    /**
     * 参数解析器
     *
     * @param argumentResolvers
     */
    @Override
    protected void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(currentUserMethodArgumentResolver());
        argumentResolvers.add(currentPlatformMethodArgumentResolver());
        super.addArgumentResolvers(argumentResolvers);
    }

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(loginRequiredInterceptor()).addPathPatterns(Constants.BASE_API_PATH + "/**")
				.excludePathPatterns(Constants.BASE_API_PATH + "/login");
		registry.addInterceptor(platformAuthInterceptor()).addPathPatterns(Constants.AUTH_API_PATH + "/**");
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
    	ObjectMapper mapper = new ObjectMapper();
    	mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
    	mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
    	mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    	mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        mapper.enable(Feature.ALLOW_COMMENTS);
        mapper.enable(Feature.ALLOW_UNQUOTED_FIELD_NAMES);
        mapper.enable(Feature.ALLOW_SINGLE_QUOTES);
        mapper.enable(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS);
        
        mapper.getSerializerProvider().setNullValueSerializer(new JsonSerializer<Object>() {
        	@Override
			public void serialize(Object value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        		gen.writeString(EMPTY);
			}
		});
        
        MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter = new MappingJackson2HttpMessageConverter();
        mappingJackson2HttpMessageConverter.setObjectMapper(mapper);
    	List<MediaType> mediaTypes = new ArrayList<MediaType>();
    	mediaTypes.add(MediaType.APPLICATION_JSON);
    	mediaTypes.add(MediaType.APPLICATION_JSON_UTF8);
    	mappingJackson2HttpMessageConverter.setSupportedMediaTypes(mediaTypes);

    	converters.add(mappingJackson2HttpMessageConverter);
    }

}
