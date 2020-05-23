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

package edp.davinci.dto.sourceDto;

import edp.davinci.core.enums.UploadModeEnum;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Data
@NotNull(message = "upload info cannot be null")
public class SourceDataUpload {

    @NotBlank(message = "uplaod table name cannot be EMPTY")
    private String tableName;

    private String primaryKeys;

    private String indexKeys;

    private Short mode = UploadModeEnum.NEW.getMode();


    public List<Map<String, String>> getIndexList() {
        List<Map<String, String>> indexs = null;
        if (null != indexKeys) {
            String[] idxs = indexKeys.split(",");
            indexs = new ArrayList<>();
            for (String idx : idxs) {
                Map<String, String> map = new HashMap<>();
                map.put("INDEX_" + idx.toUpperCase(), idx);
                indexs.add(map);
            }
        }
        return indexs;
    }

}
