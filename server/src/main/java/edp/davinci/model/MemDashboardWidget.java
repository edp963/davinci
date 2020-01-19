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

import edp.core.model.RecordInfo;
import lombok.Data;

import javax.validation.constraints.Min;

@Data
public class MemDashboardWidget extends RecordInfo<MemDashboardWidget> {

    @Min(value = 1L, message = "Invalid id")
    private Long id;

    @Min(value = 1L, message = "Invalid dashboard id")
    private Long dashboardId;

    @Min(value = 1L, message = "Invalid widget id")
    private Long widgetId;

    private Integer x;

    private Integer y;

    @Min(value = 0, message = "Invalid width")
    private Integer width;

    @Min(value = 0, message = "Invalid height")
    private Integer height;

    private Boolean polling = false;

    private Integer frequency;

    private String config;
}