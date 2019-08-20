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

package edp.davinci.model;

import com.alibaba.fastjson.annotation.JSONField;
import edp.core.model.RecordInfo;
import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "dashboard cannot be null")
public class Dashboard extends RecordInfo<Dashboard> {

    @Min(value = 1L, message = "Invalid dashboard id")
    private Long id;

    @NotBlank(message = "dashboard name cannot be EMPTY")
    private String name;

    @Min(value = 1L, message = "Invalid dashboard portal id")
    private Long dashboardPortalId;

    @Min(value = (short) 0, message = "Invalid dashboard type")
    @Max(value = (short) 2, message = "Invalid dashboard type")
    private Short type;

    private Integer index = 0;

    private Long parentId;

    private String config;

    @JSONField(serialize = false)
    private String fullParentId = null != parentId ? parentId.toString() : null;

    @Override
    public String toString() {
        return "Dashboard{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", dashboardPortalId=" + dashboardPortalId +
                ", type=" + type +
                ", index=" + index +
                ", parentId=" + parentId +
                ", config='" + config + '\'' +
                ", fullParentId='" + fullParentId + '\'' +
                '}';
    }
}