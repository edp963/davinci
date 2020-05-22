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
 */

package edp.davinci.dto.viewDto;

import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class ConcurrencyQueryFactor {
    private boolean isDistinct;
    private List<String> sqlList;

    private Integer pageNo;
    private Integer pageSize;
    private Integer totalCount;
    private Integer limit;
    private Set<String> excludeColumns;

    public static ConcurrencyQueryFactorBuilder builder() {
        return new ConcurrencyQueryFactorBuilder();
    }

    public static final class ConcurrencyQueryFactorBuilder {
        private boolean isDistinct;
        private List<String> sqlList;
        private Integer pageNo;
        private Integer pageSize;
        private Integer totalCount;
        private Integer limit;
        private Set<String> excludeColumns;

        public ConcurrencyQueryFactorBuilder withIsDistinct(boolean isDistinct) {
            this.isDistinct = isDistinct;
            return this;
        }

        public ConcurrencyQueryFactorBuilder withSqlList(List<String> sqlList) {
            this.sqlList = sqlList;
            return this;
        }

        public ConcurrencyQueryFactorBuilder withPageNo(Integer pageNo) {
            this.pageNo = pageNo;
            return this;
        }

        public ConcurrencyQueryFactorBuilder withPageSize(Integer pageSize) {
            this.pageSize = pageSize;
            return this;
        }

        public ConcurrencyQueryFactorBuilder withTotalCount(Integer totalCount) {
            this.totalCount = totalCount;
            return this;
        }

        public ConcurrencyQueryFactorBuilder withLimit(Integer limit) {
            this.limit = limit;
            return this;
        }

        public ConcurrencyQueryFactorBuilder withExcludeColumns(Set<String> excludeColumns) {
            this.excludeColumns = excludeColumns;
            return this;
        }

        public ConcurrencyQueryFactor build() {
            ConcurrencyQueryFactor concurrencyQueryFactor = new ConcurrencyQueryFactor();
            concurrencyQueryFactor.setSqlList(sqlList);
            concurrencyQueryFactor.setPageNo(pageNo);
            concurrencyQueryFactor.setPageSize(pageSize);
            concurrencyQueryFactor.setTotalCount(totalCount);
            concurrencyQueryFactor.setLimit(limit);
            concurrencyQueryFactor.setExcludeColumns(excludeColumns);
            concurrencyQueryFactor.isDistinct = this.isDistinct;
            return concurrencyQueryFactor;
        }
    }
}
