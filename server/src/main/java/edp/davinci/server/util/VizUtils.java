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

package edp.davinci.server.util;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.dao.ViewExtendMapper;
import edp.davinci.server.dto.view.SimpleView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class VizUtils {

    @Autowired
    private ViewExtendMapper viewExtendMapper;

    private static ViewExtendMapper staticViewExtendMapper;

    @PostConstruct
    public void init() {
        staticViewExtendMapper = viewExtendMapper;
    }

    public static Set<SimpleView> getControllerViews(List<Map<String, Object>> config) {
        Set<SimpleView> simpleViews = new HashSet<>();
        if (!CollectionUtils.isEmpty(config)) {
            config.stream().filter(m -> m.containsKey("valueViewId")).collect(Collectors.toList()).forEach(m -> {
                simpleViews.add(staticViewExtendMapper.getSimpleViewById(Long.parseLong(String.valueOf(m.get("valueViewId")))));
            });
        }
        return simpleViews;
    }

}
