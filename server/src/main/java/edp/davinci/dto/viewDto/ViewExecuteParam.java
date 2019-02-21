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
import edp.core.utils.SqlUtils;
import lombok.Data;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Data
public class ViewExecuteParam {
    private String[] groups;
    private List<Aggregator> aggregators;
    private List<Order> orders;
    private String[] filters;
    private List<Param> params;
    private Boolean cache;
    private Long expired;
    private int limit = 0;
    private int pageNo = -1;
    private int pageSize = -1;

    private boolean nativeQuery = false;

    public List<Order> getOrders(String jdbcUrl) {
        List<Order> list = null;
        if (null != this.orders && this.orders.size() > 0) {
            list = new ArrayList<>();
            Iterator<Order> iterator = this.orders.iterator();
            String regex = "sum\\(.*\\)|avg\\(.*\\)|count\\(.*\\)|COUNTDISTINCT\\(.*\\)|max\\(.*\\)|min\\(.*\\)";
            Pattern pattern = Pattern.compile(regex);
            while (iterator.hasNext()) {
                Order order = iterator.next();
                String column = order.getColumn().trim();
                Matcher matcher = pattern.matcher(order.getColumn().trim());
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

    public List<String> getAggregators(String jdbcUrl) {
        List<String> list = null;
        if (null != this.aggregators && this.aggregators.size() > 0) {
            Iterator<Aggregator> iterator = this.aggregators.iterator();
            list = new ArrayList<>();
            while (iterator.hasNext()) {
                Aggregator next = iterator.next();
                StringBuilder sb = new StringBuilder();
                if ("COUNTDISTINCT".equals(next.getFunc().trim().toUpperCase())) {
                    sb.append("COUNT(").append("DISTINCT").append(" ");
                    sb.append(getField(next.getColumn(), jdbcUrl));
                    sb.append(")");
                    sb.append(" AS ").append(SqlUtils.getAliasPrefix(jdbcUrl)).append("COUNTDISTINCT(");
                    sb.append(next.getColumn());
                    sb.append(")").append(SqlUtils.getAliasSuffix(jdbcUrl));
                } else {
                    sb.append(next.getFunc()).append("(");
                    sb.append(getField(next.getColumn(), jdbcUrl));
                    sb.append(")");
                    sb.append(" AS ").append(SqlUtils.getAliasPrefix(jdbcUrl));
                    sb.append(next.getFunc()).append("(");
                    sb.append(next.getColumn());
                    sb.append(")").append(SqlUtils.getAliasSuffix(jdbcUrl));
                }
                list.add(sb.toString());
            }
        }
        return list;
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
