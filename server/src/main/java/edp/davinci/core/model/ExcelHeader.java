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

package edp.davinci.core.model;

import com.alibaba.fastjson.JSONObject;
import lombok.Data;
import lombok.ToString;
import org.apache.commons.lang.StringUtils;

import java.util.List;
import java.util.Map;

@Data
@ToString
public class ExcelHeader {
    private String key;
    private String alias;
    private String type;
    private boolean isMerged;
    private int row;
    private int col;
    private int rowspan;
    private int colspan;
    private int[] range;
    private List style;
    private FieldFormat format;

    public void setKey(String key) {
        this.key = key;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public void setIsMerged(boolean merged) {
        isMerged = merged;
    }

    public void setIsMerged(Boolean merged) {
        isMerged = merged;
    }

    public void setRow(String row) {
        this.row = Integer.parseInt(row);
    }

    public void setCol(String col) {
        this.col = Integer.parseInt(col);
    }

    public void setRowspan(String rowspan) {
        this.rowspan = Integer.parseInt(rowspan);
    }

    public void setColspan(String colspan) {
        this.colspan = Integer.parseInt(colspan);
    }

    public void setRange(int[] range) {
        this.range = range;
    }

    public void setStyle(List<String> style) {
        this.style = style;
    }

    public void setFormat(String formatStr) {
        Map<String, Object> map = JSONObject.parseObject(formatStr, Map.class);
        String formatType = (String)map.get("formatType");
        if(StringUtils.isEmpty(formatType)) {
            formatType = "default";
        }
        JSONObject formatObj = (JSONObject)map.get(formatType);

        switch (formatType) {
            case "numeric":
                this.format = JSONObject.toJavaObject(formatObj, FieldNumeric.class);
                break;
            case "currency":
                this.format = JSONObject.toJavaObject(formatObj, FieldCurrency.class);
                break;
            case "percentage":
                this.format = JSONObject.toJavaObject(formatObj, FieldPercentage.class);
                break;
            case "scientificNotation":
                this.format = JSONObject.toJavaObject(formatObj, FieldScientificNotation.class);
                break;
            default:
                this.format = new FieldCustom();
                this.format.setFormatType("default");
                break;
        }
    }

}
