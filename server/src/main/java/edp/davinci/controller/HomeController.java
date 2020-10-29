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

package edp.davinci.controller;

import edp.core.annotation.AuthIgnore;
import edp.davinci.core.common.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import springfox.documentation.annotations.ApiIgnore;

import java.util.HashMap;
import java.util.Map;

@ApiIgnore
@Controller
public class HomeController {

    @Autowired
    private Environment environment;

    @RequestMapping("swagger")
    public String swagger() {
        return "redirect:swagger-ui.html";
    }

    @RequestMapping(value = {"", "/"})
    public String index() {
        return "index";
    }

    @RequestMapping("share/")
    public String shareIndex() {
        return "share";
    }

    @RequestMapping(Constants.BASE_API_PATH + "/configurations")
    @AuthIgnore
    @ResponseBody
    public Map<String, Object> configurations() {
        Map<String, Object> configs = new HashMap<>();
        configs.put("version", environment.getProperty("davinci.version"));
        configs.put("jwtToken", new HashMap<String, Object>() {{
            put("timeout", environment.getProperty("jwtToken.timeout"));
        }});
        configs.put("security", new HashMap<String, Object>() {{
            put("oauth2", new HashMap<String, Object>() {{
                put("enable", Boolean.valueOf(environment.getProperty("security.oauth2.enable")));
            }});
        }});

        return new HashMap<String, Object>() {{
            put("payload", configs);
        }};
    }
}
