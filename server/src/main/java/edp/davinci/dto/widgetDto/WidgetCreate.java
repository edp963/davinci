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

package edp.davinci.dto.widgetDto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@NotNull(message = "widget cannot be null")
@Data
public class WidgetCreate {
    @NotBlank(message = "widget name cannot be EMPTY")
    private String name;

    private String description;

    @Min(value = 1L, message = "Invalid view id")
    private Long viewId;

    @Min(value = 1L, message = "Invalid project id")
    private Long projectId;

    @Min(value = 1L, message = "Invalid type")
    private Long type;

    private Boolean publish = true;

    private String config;
}
