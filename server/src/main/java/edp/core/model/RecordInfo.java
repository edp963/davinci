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

package edp.core.model;

import com.alibaba.fastjson.annotation.JSONField;
import lombok.Data;

import java.util.Date;

@Data
public class RecordInfo<T> {

    @JSONField(serialize = false)
    Long createBy;

    @JSONField(serialize = false)
    Date createTime;

    @JSONField(serialize = false)
    Long updateBy;

    @JSONField(serialize = false)
    Date updateTime;

    public T createdBy(Long userId) {
        this.createBy = userId;
        this.createTime = new Date();
        return (T) this;
    }

    public void updatedBy(Long userId) {
        this.updateBy = userId;
        this.updateTime = new Date();
    }
}
