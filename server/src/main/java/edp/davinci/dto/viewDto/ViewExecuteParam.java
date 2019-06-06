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

import com.alibaba.druid.util.StringUtils;
import edp.core.utils.CollectionUtils;
import edp.core.utils.SqlUtils;
import lombok.Data;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.*;

@Data
public class ViewExecuteParam {
    private List<String> groups;
    private List<Aggregator> aggregators;
    private List<Order> orders;
    private List<String> filters;
    private List<Param> params;
    private Boolean cache;
    private Long expired;
    private int limit = 0;
    private int pageNo = -1;
    private int pageSize = -1;
    private int totalCount = 0;

    private boolean nativeQuery = false;


    public ViewExecuteParam() {
    }

    public ViewExecuteParam(List<String> groupList,
                            List<Aggregator> aggregators,
                            List<Order> orders,
                            List<String> filterList,
                            List<Param> params,
                            Boolean cache,
                            Long expired,
                            Boolean nativeQuery) {
        this.groups = groupList;
        this.aggregators = aggregators;
        this.orders = orders;
        this.filters = filterList;
        this.params = params;
        this.cache = cache;
        this.expired = expired;
        this.nativeQuery = nativeQuery;
    }

    public List<String> getGroups() {
        if (!CollectionUtils.isEmpty(this.groups)) {
            this.groups = groups.stream().filter(g -> !StringUtils.isEmpty(g)).collect(Collectors.toList());
        }

        if (CollectionUtils.isEmpty(this.groups)) {
            return null;
        }

        return this.groups;
    }

    public List<String> getFilters() {
        if (!CollectionUtils.isEmpty(this.filters)) {
            this.filters = filters.stream().filter(f -> !StringUtils.isEmpty(f)).collect(Collectors.toList());
        }

        if (CollectionUtils.isEmpty(this.filters)) {
            return null;
        }

        return this.filters;
    }

    public List<Order> getOrders(String jdbcUrl) {
        List<Order> list = null;
        if (!CollectionUtils.isEmpty(orders)) {
            list = new ArrayList<>();
            Iterator<Order> iterator = this.orders.iterator();
            String regex = "sum\\(.*\\)|avg\\(.*\\)|count\\(.*\\)|COUNTDISTINCT\\(.*\\)|max\\(.*\\)|min\\(.*\\)";
            Pattern pattern = Pattern.compile(regex);
            while (iterator.hasNext()) {
                Order order = iterator.next();
                String column = order.getColumn().trim();
                Matcher matcher = pattern.matcher(order.getColumn().trim().toLowerCase());
                if (!matcher.find()) {
                    String prefix = SqlUtils.getKeywordPrefix(jdbcUrl);
                    String suffix = SqlUtils.getKeywordSuffix(jdbcUrl);
                    StringBuilder columnBuilder = new StringBuilder();
                    if (!column.startsWith(prefix)) {
                        columnBuilder.append(prefix);
                    }
                    columnBuilder.append(column);
                    if (!column.endsWith(suffix)) {
                        columnBuilder.append(suffix);
                    }
                    order.setColumn(columnBuilder.toString());
                }
                list.add(order);
            }
        }
        return list;
    }

    public void addExcludeColumn(Set<String> excludeColumns, String jdbcUrl) {
        if (!CollectionUtils.isEmpty(excludeColumns) && !CollectionUtils.isEmpty(aggregators)) {
            excludeColumns.addAll(this.aggregators.stream()
                    .filter(a -> !CollectionUtils.isEmpty(excludeColumns) && excludeColumns.contains(a.getColumn()))
                    .map(a -> formatColumn(a.getColumn(), a.getFunc(), jdbcUrl, true))
                    .collect(Collectors.toSet())
            );
        }
    }

    public List<String> getAggregators(String jdbcUrl) {
        if (!CollectionUtils.isEmpty(aggregators)) {
            return this.aggregators.stream().map(a -> formatColumn(a.getColumn(), a.getFunc(), jdbcUrl, false)).collect(Collectors.toList());
        }
        return null;
    }


    private String formatColumn(String column, String func, String jdbcUrl, boolean isLable) {
        if (isLable) {
            return String.join(EMPTY, func.trim(), PARENTHESES_START, column.trim(), PARENTHESES_END);
        } else {
            StringBuilder sb = new StringBuilder();
            if ("COUNTDISTINCT".equals(func.trim().toUpperCase())) {
                sb.append("COUNT").append(PARENTHESES_START).append("DISTINCT").append(SPACE);
                sb.append(getField(column, jdbcUrl));
                sb.append(PARENTHESES_END);
                sb.append(" AS ").append(SqlUtils.getAliasPrefix(jdbcUrl)).append("COUNTDISTINCT").append(PARENTHESES_START);
                sb.append(column);
                sb.append(PARENTHESES_END).append(SqlUtils.getAliasSuffix(jdbcUrl));
            } else {
                sb.append(func.trim()).append(PARENTHESES_START);
                sb.append(getField(column, jdbcUrl));
                sb.append(PARENTHESES_END);
                sb.append(" AS ").append(SqlUtils.getAliasPrefix(jdbcUrl));
                sb.append(func.trim()).append(PARENTHESES_START);
                sb.append(column);
                sb.append(PARENTHESES_END).append(SqlUtils.getAliasSuffix(jdbcUrl));
            }
            return sb.toString();
        }
    }

    public static String getField(String field, String jdbcUrl) {
        String keywordPrefix = SqlUtils.getKeywordPrefix(jdbcUrl);
        String keywordSuffix = SqlUtils.getKeywordSuffix(jdbcUrl);
        if (!StringUtils.isEmpty(keywordPrefix) && !StringUtils.isEmpty(keywordSuffix)) {
            return keywordPrefix + field + keywordSuffix;
        }
        return field;
    }
}
