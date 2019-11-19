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
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NotNull(message = "display info cannot be null")
public class Display extends RecordInfo<Display> {
    @Min(value = 1L, message = "Invalid display id")
    private Long id;

    @NotBlank(message = "display name cannot be EMPTY")
    private String name;

    private String description;

    @Min(value = 1L, message = "project id cannot be EMPTY")
    private Long projectId;

    private String avatar;

    private Boolean publish = false;

    @Override
    public String toString() {
        return "Display{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", projectId=" + projectId +
                ", avatar='" + avatar + '\'' +
                ", publish=" + publish +
                '}';
    }
}