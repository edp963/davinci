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
 */

package edp.davinci.server.dto.display;

import lombok.Data;

import java.util.List;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import edp.davinci.core.dao.entity.MemDisplaySlideWidget;

@Data
@NotNull(message = "Display slide widget cannot be null")
public class MemDisplaySlideWidgetDTO extends MemDisplaySlideWidget {
	
    @Min(value = 1L, message = "Invalid id")
    private Long id;

    @Min(value = 1L, message = "Invalid display slide id")
    private Long displaySlideId;

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @Min(value = 0, message = "Invalid slide widget type")
    private Short type;

    private Integer index = 0;

    @NotBlank(message = "Params cannot be empty")
    private String params;
	
    private List<Long> roleIds;
}
