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

import edp.davinci.core.enums.DownloadTaskStatus;
import lombok.Data;

import java.util.Date;
import java.util.UUID;

import static edp.core.consts.Consts.EMPTY;
import static edp.core.consts.Consts.MINUS;

@Data
public class ShareDownloadRecord extends DownloadRecordBaseInfo {
    private String id;

    public ShareDownloadRecord() {
        UUID uuid = UUID.randomUUID();
        this.id = uuid.toString().replace(MINUS, EMPTY);
        this.setCreateTime(new Date());
        this.setStatus(DownloadTaskStatus.PROCESSING.getStatus());
    }
}
