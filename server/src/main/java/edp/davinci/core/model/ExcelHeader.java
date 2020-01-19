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

import lombok.Data;
import lombok.ToString;

import java.util.List;

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
    private Object format;

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
