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

package edp.davinci.server.model;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import edp.davinci.commons.util.JSONUtils;
import lombok.Data;
import lombok.ToString;
import org.apache.commons.lang.StringUtils;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Data
@ToString
public class ExcelHeader {

    public static class FormatDeserialize extends JsonDeserializer<Object> {

        @Override
        public Object deserialize(JsonParser p, DeserializationContext ctxt)
                throws IOException, JsonProcessingException {
            Object value = p.readValueAs(Object.class);
            FieldFormat format = new FieldFormat();
            if (!(value instanceof Map)) {
                format.setFormatType("default");
                return format;
            }

            Map<String, Object> map = (Map) value;
            String formatType = (String) map.get("formatType");
            if (StringUtils.isEmpty(formatType)) {
                formatType = "default";
            }
            format.setFormatType(formatType);
            Map formatMap = (Map) map.get(formatType);
            switch (formatType) {
                case "numeric":
                    format = JSONUtils.toObject(formatMap, FieldNumeric.class);
                    break;
                case "currency":
                    format = JSONUtils.toObject(formatMap, FieldCurrency.class);
                    break;
                case "percentage":
                    format = JSONUtils.toObject(formatMap, FieldPercentage.class);
                    break;
                case "scientificNotation":
                    format = JSONUtils.toObject(formatMap, FieldScientificNotation.class);
                    break;
                default:
                    break;
            }
            return format;
        }
    }

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

    @JsonDeserialize(using = FormatDeserialize.class)
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
}
