/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2018 EDP
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

package edp.davinci.dto.displayDto;

import edp.davinci.model.Display;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

@Data
public class DisplayUpdateDto extends Display {
    private Long[] teamIds;

    public List<Long> getTeamIds() {
        return null == this.teamIds || this.teamIds.length == 0 ? null : Arrays.asList(this.teamIds);
    }
}
