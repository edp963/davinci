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

package edp.davinci.dto.roleDto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Data
@NotNull
public class RelRoleProjectDto {

    @Min(value = (short) 0, message = "Invalid source permission")
    @Max(value = (short) 3, message = "Invalid source permission")
    private Short sourcePermission = 1;

    @Min(value = (short) 0, message = "Invalid view permission")
    @Max(value = (short) 3, message = "Invalid view permission")
    private Short viewPermission = 1;

    @Min(value = (short) 0, message = "Invalid widget permission")
    @Max(value = (short) 3, message = "Invalid widget permission")
    private Short widgetPermission = 1;

    @Min(value = (short) 0, message = "Invalid viz permission")
    @Max(value = (short) 3, message = "Invalid viz permission")
    private Short vizPermission = 1;

    @Min(value = (short) 0, message = "Invalid schedule permission")
    @Max(value = (short) 3, message = "Invalid schedule permission")
    private Short schedulePermission = 1;

    private Boolean sharePermission = false;

    private Boolean downloadPermission = false;
}
