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

package edp.davinci.core.enums;

public enum FileTypeEnum {
    XLSX("excel", ".xlsx"),
    XLS("excel", ".xls"),
    CSV("csv", ".csv");

    private String type;
    private String format;

    public String getType() {
        return type;
    }

    public String getFormat() {
        return format;
    }

    FileTypeEnum(String type, String format) {
        this.type = type;
        this.format = format;
    }
}
