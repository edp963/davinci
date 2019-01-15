/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.dto.viewDto;

import edp.core.consts.Consts;
import edp.core.utils.SqlUtils;
import edp.davinci.core.enums.SqlOperatorEnum;
import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@NotNull(message = "request parameter cannot be null")
public class DistinctParam {
    @NotEmpty(message = "distinct column cannot be empty")
    private List<String> columns;

    private List<WhereParam> parents;

    public List<Map<String, String>> getParents() {
        if (null != this.parents && this.parents.size() > 0) {
            List<Map<String, String>> list = new ArrayList<>();
            parents.forEach(p -> {
                Map<String, String> map = new HashMap<>();
                if (null != p.getValue() && p.getValue().size() > 0) {
                    StringBuilder expBuilder = new StringBuilder();
                    if (p.getValue().size() == 1) {
                        expBuilder.append(Consts.space)
                                .append(SqlOperatorEnum.EQUALSTO.getValue())
                                .append(Consts.space)
                                .append(p.getValue().get(0));
                    } else {
                        expBuilder.append(Consts.space)
                                .append(SqlOperatorEnum.IN.getValue())
                                .append(Consts.space)
                                .append(p.getValue().stream().collect(Collectors.joining(",", "(", ")")));
                    }
                    map.put(p.getColumn(), expBuilder.toString());
                }
                list.add(map);
            });
            return list;
        }
        return null;
    }
}
