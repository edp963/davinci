/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2019 EDP
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

package edp;

import com.google.common.collect.Lists;
import edp.core.consts.Consts;
import edp.core.enums.HttpCodeEnum;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RequestMethod;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.builders.ResponseMessageBuilder;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.ApiKey;
import springfox.documentation.service.ResponseMessage;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableSwagger2
public class SwaggerConfiguration {
    @Bean
    public Docket createRestApi() {

        List<ResponseMessage> responseMessageList = new ArrayList<>();
        responseMessageList.add(new ResponseMessageBuilder().code(HttpCodeEnum.OK.getCode()).message(HttpCodeEnum.OK.getMessage()).build());
        responseMessageList.add(new ResponseMessageBuilder().code(HttpCodeEnum.FAIL.getCode()).message(HttpCodeEnum.FAIL.getMessage()).build());
        responseMessageList.add(new ResponseMessageBuilder().code(HttpCodeEnum.UNAUTHORIZED.getCode()).message(HttpCodeEnum.UNAUTHORIZED.getMessage()).build());
        responseMessageList.add(new ResponseMessageBuilder().code(HttpCodeEnum.FORBIDDEN.getCode()).message(HttpCodeEnum.FORBIDDEN.getMessage()).build());
        responseMessageList.add(new ResponseMessageBuilder().code(HttpCodeEnum.SERVER_ERROR.getCode()).message(HttpCodeEnum.SERVER_ERROR.getMessage()).build());


        return new Docket(DocumentationType.SWAGGER_2)
                .globalResponseMessage(RequestMethod.GET, responseMessageList)
                .globalResponseMessage(RequestMethod.POST, responseMessageList)
                .globalResponseMessage(RequestMethod.PUT, responseMessageList)
                .globalResponseMessage(RequestMethod.DELETE, responseMessageList)

                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("edp.davinci.controller"))
                .paths(PathSelectors.any())
                .build()
                .securitySchemes(Lists.newArrayList(apiKey()));

    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("davinci api")
                .version("1.0")
                .build();
    }

    private ApiKey apiKey() {
        return new ApiKey(Consts.TOKEN_HEADER_STRING, Consts.TOKEN_HEADER_STRING, "header");
    }

}
