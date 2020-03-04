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

package edp.davinci.server.dto.dashboard;

import lombok.Data;

import java.util.List;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import com.alibaba.fastjson.annotation.JSONField;

import edp.davinci.core.dao.entity.Dashboard;

@Data
@NotNull(message = "Dashboard cannot be null")
public class DashboardDTO extends Dashboard {

	@Min(value = 1L, message = "Invalid dashboard id")
	private Long id;
	
    @NotBlank(message = "Dashboard name cannot be empty")
    private String name;
    
    @Min(value = 1L, message = "Invalid dashboard portal id")
    private Long dashboardPortalId;
    
    @Min(value = (short) 0, message = "Invalid dashboard type")
    @Max(value = (short) 2, message = "Invalid dashboard type")
    private Short type;
    
    @JSONField(serialize = false)
    private String fullParentId = null != getParentId() ? getParentId().toString() : null;

	private List<Long> roleIds;
}
