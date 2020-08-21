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

package edp.davinci.dto.cronJobDto;

import edp.core.utils.DateUtils;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

public class MsgMailExcel {

    @Getter
    private Long id;

    @Setter
    private Date date;

    @Getter
    @Setter
    private Exception exception;

    public MsgMailExcel(Long id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "Date:" + DateUtils.dateFormat(date, "yyyy-MM-dd HH:ss:mm") + ", exception:" + exception.getMessage();
    }
}
