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

import javax.validation.constraints.NotBlank;

@Data
public class Aggregator {

    @NotBlank(message = "Invalid aggregator column")
    private String column;

    private String func;

    public Aggregator() {
    }

    public Aggregator(String column, String func) {
        this.column = column;
        this.func = func;
    }
}
