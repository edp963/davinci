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

package edp.davinci.server.dto.view;

import java.util.List;
import java.util.stream.Collectors;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.data.pojo.Aggregator;
import edp.davinci.data.pojo.Filter;
import edp.davinci.data.pojo.Order;
import edp.davinci.data.pojo.Param;
import lombok.Data;
import lombok.ToString;

@Data
@ToString(callSuper = true)
public class WidgetQueryParam extends ConcurrencyStrategy {
    private List<String> groups;
    private List<Aggregator> aggregators;
    private List<Order> orders;
    private List<Filter> filters;
    private List<Param> params;
    private Boolean cache = false;
    private Long expired = -1L;
    private Boolean flush = false;
    private int limit = 0;
    private int pageNo = -1;
    private int pageSize = -1;
    private int totalCount = 0;
    private final String type = "query"; 

    private boolean nativeQuery = false;

    public WidgetQueryParam() {

    }

    public WidgetQueryParam(List<String> groups,
                            List<Aggregator> aggregators,
                            List<Order> orders,
                            List<String> filters,
                            List<Param> params,
                            Boolean cache,
                            Long expired,
                            Boolean nativeQuery) {
        this.groups = groups;
        this.aggregators = aggregators;
        this.orders = orders;
        this.filters = filters.stream().map(f -> {
            return JSONUtils.toObject(f, Filter.class);
        }).collect(Collectors.toList());
        this.params = params;
        this.cache = cache;
        this.expired = expired;
        this.nativeQuery = nativeQuery;
    }
}
