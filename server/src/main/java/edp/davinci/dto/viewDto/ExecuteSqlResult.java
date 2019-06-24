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

package edp.davinci.dto.viewDto;

import edp.core.model.Paginate;
import edp.core.model.QueryColumn;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ExecuteSqlResult extends Paginate<Map<String, Object>> {

    private List<QueryColumn> columns;

    public ExecuteSqlResult(List<QueryColumn> columns, Paginate<Map<String, Object>> paginate) {
        this.columns = columns;
        this.setPageNo(paginate.getPageNo());
        this.setPageSize(paginate.getPageSize());
        this.setTotalCount(paginate.getTotalCount());
        this.setResultList(paginate.getResultList());
    }
}
