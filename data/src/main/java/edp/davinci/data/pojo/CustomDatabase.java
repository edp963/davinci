/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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

package edp.davinci.data.pojo;

import static edp.davinci.commons.Constants.EMPTY;

import com.fasterxml.jackson.annotation.JsonProperty;

import edp.davinci.commons.util.StringUtils;
import lombok.Data;

@Data
public class CustomDatabase {

	private String name;
    private String desc;
    private String version;
    private String driver;
    
    @JsonProperty("keyword_prefix")
    private String keywordPrefix;

    @JsonProperty("keyword_suffix")
    private String keywordSuffix;

    @JsonProperty("alias_prefix")
    private String aliasPrefix;

    @JsonProperty("alias_suffix")
    private String aliasSuffix;

    public void setKeywordPrefix(String keywordPrefix) {
        this.keywordPrefix = removeEscapes(keywordPrefix);
    }

    public void setKeywordSuffix(String keywordSuffix) {
        this.keywordSuffix = removeEscapes(keywordSuffix);
    }

    public void setAliasPrefix(String aliasPrefix) {
        this.aliasPrefix = removeEscapes(aliasPrefix);
    }

    public void setAliasSuffix(String aliasSuffix) {
        this.aliasSuffix = removeEscapes(aliasSuffix);
    }

    public String getKeywordPrefix() {
        return removeEscapes(keywordPrefix);
    }

    public String getKeywordSuffix() {
        return removeEscapes(keywordSuffix);
    }

    public String getAliasPrefix() {
    	String v = removeEscapes(aliasPrefix);
        return StringUtils.isEmpty(v) ? "'" : v;
    }

    public String getAliasSuffix() {
    	String v = removeEscapes(aliasSuffix);
        return StringUtils.isEmpty(v) ? "'" : v;
    }

    private String removeEscapes (String value) {

    	if (StringUtils.isEmpty(value)) {
            return EMPTY;
        }

        if (value.indexOf("\\") > -1) {
            return value.replace("\\", EMPTY);
        }

        return value;
    }
}
