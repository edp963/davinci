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

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
@NotNull(message = "view cannot be null")
public class ViewUpdate {

    @Min(value = 1L, message = "Invalid view Id")
    private Long id;

    @NotBlank(message = "view name cannot be EMPTY")
    private String name;

    private String description;

    @Min(value = 1L, message = "Invalid source Id")
    private Long sourceId;

    private String sql;

    private String model;

    private String variable;

    private String config;

    private List<RelRoleViewDto> roles;
}
