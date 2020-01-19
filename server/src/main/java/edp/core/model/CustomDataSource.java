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

package edp.core.model;

import com.alibaba.druid.util.StringUtils;
import lombok.Data;

import static edp.core.consts.Consts.EMPTY;

@Data
public class CustomDataSource {
    private String name;
    private String desc;
    private String version;
    private String driver;
    private String keyword_prefix;
    private String keyword_suffix;
    private String alias_prefix;
    private String alias_suffix;


    public void setKeyword_prefix(String keyword_prefix) {
        this.keyword_prefix = getStringValue(keyword_prefix);
    }

    public void setKeyword_suffix(String keyword_suffix) {
        this.keyword_suffix = getStringValue(keyword_suffix);
    }

    public void setAlias_prefix(String alias_prefix) {
        this.alias_prefix = getStringValue(alias_prefix);
    }

    public void setAlias_suffix(String alias_suffix) {
        this.alias_suffix = getStringValue(alias_suffix);
    }

    public String getKeyword_prefix() {
        return getStringValue(keyword_prefix);
    }

    public String getKeyword_suffix() {
        return getStringValue(keyword_suffix);
    }

    public String getAlias_prefix() {
        return StringUtils.isEmpty(getStringValue(alias_prefix)) ? "'" : getStringValue(alias_prefix);
    }

    public String getAlias_suffix() {
        return StringUtils.isEmpty(getStringValue(alias_suffix)) ? "'" : getStringValue(alias_suffix);
    }

    private String getStringValue(String value) {
        if (StringUtils.isEmpty(value)) {
            return EMPTY;
        }

        if (value.indexOf("\\") > -1) {
            return value.replace("\\", EMPTY);
        }
        return value;
    }
}
