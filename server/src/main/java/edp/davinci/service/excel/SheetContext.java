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

package edp.davinci.service.excel;

import edp.core.model.QueryColumn;
import edp.core.utils.SqlUtils;
import edp.davinci.core.model.ExcelHeader;
import lombok.Data;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;

import java.io.Serializable;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 18:21
 * To change this template use File | Settings | File Templates.
 */
@Data
public class SheetContext implements Serializable {
    private List<String> executeSql;
    private List<String> querySql;
    private List<QueryColumn> totalColumns;
    private List<QueryColumn> queryColumns;
    private List<String> excludeColumns;
    private Sheet sheet;
    private Workbook workbook;
    private Boolean contain;
    private SqlUtils sqlUtils;
    private Boolean isTable;
    private List<ExcelHeader> excelHeaders;
    private Long dashboardId;
    private Long widgetId;
    private String name;
    private int sheetNo;
    private MsgWrapper wrapper;
    private int resultLimit;
    private String taskKey;
    private Logger customLogger;


    public static final class SheetContextBuilder {
        private List<String> executeSql;
        private List<String> querySql;
        private List<QueryColumn> totalColumns;
        private List<QueryColumn> queryColumns;
        private List<String> excludeColumns;
        private Sheet sheet;
        private Workbook workbook;
        private Boolean contain;
        private SqlUtils sqlUtils;
        private Boolean isTable;
        private List<ExcelHeader> excelHeaders;
        private Long dashboardId;
        private Long widgetId;
        private String name;
        private int sheetNo;
        private MsgWrapper wrapper;
        private int resultLimit;
        private String taskKey;
        private Logger customLogger;

        private SheetContextBuilder() {
        }

        public static SheetContextBuilder newBuilder() {
            return new SheetContextBuilder();
        }

        public SheetContextBuilder withExecuteSql(List<String> executeSql) {
            this.executeSql = executeSql;
            return this;
        }

        public SheetContextBuilder withQuerySql(List<String> querySql) {
            this.querySql = querySql;
            return this;
        }

        public SheetContextBuilder withTotalColumns(List<QueryColumn> totalColumns) {
            this.totalColumns = totalColumns;
            return this;
        }

        public SheetContextBuilder withQueryColumns(List<QueryColumn> queryColumns) {
            this.queryColumns = queryColumns;
            return this;
        }

        public SheetContextBuilder withExcludeColumns(List<String> excludeColumns) {
            this.excludeColumns = excludeColumns;
            return this;
        }

        public SheetContextBuilder withSheet(Sheet sheet) {
            this.sheet = sheet;
            return this;
        }

        public SheetContextBuilder withWorkbook(Workbook workbook) {
            this.workbook = workbook;
            return this;
        }

        public SheetContextBuilder withContain(Boolean contain) {
            this.contain = contain;
            return this;
        }

        public SheetContextBuilder withSqlUtils(SqlUtils sqlUtils) {
            this.sqlUtils = sqlUtils;
            return this;
        }

        public SheetContextBuilder withIsTable(Boolean isTable) {
            this.isTable = isTable;
            return this;
        }

        public SheetContextBuilder withExcelHeaders(List<ExcelHeader> excelHeaders) {
            this.excelHeaders = excelHeaders;
            return this;
        }

        public SheetContextBuilder withDashboardId(Long dashboardId) {
            this.dashboardId = dashboardId;
            return this;
        }

        public SheetContextBuilder withWidgetId(Long widgetId) {
            this.widgetId = widgetId;
            return this;
        }

        public SheetContextBuilder withName(String name) {
            this.name = name;
            return this;
        }

        public SheetContextBuilder withSheetNo(int sheetNo) {
            this.sheetNo = sheetNo;
            return this;
        }

        public SheetContextBuilder withWrapper(MsgWrapper wrapper) {
            this.wrapper = wrapper;
            return this;
        }

        public SheetContextBuilder withResultLimit(int resultLimit) {
            this.resultLimit = resultLimit;
            return this;
        }

        public SheetContextBuilder withTaskKey(String taskKey) {
            this.taskKey = taskKey;
            return this;
        }

        public SheetContextBuilder withCustomLogger(Logger customLogger) {
            this.customLogger = customLogger;
            return this;
        }

        public SheetContext build() {
            SheetContext sheetContext = new SheetContext();
            sheetContext.setExecuteSql(executeSql);
            sheetContext.setQuerySql(querySql);
            sheetContext.setTotalColumns(totalColumns);
            sheetContext.setQueryColumns(queryColumns);
            sheetContext.setExcludeColumns(excludeColumns);
            sheetContext.setSheet(sheet);
            sheetContext.setWorkbook(workbook);
            sheetContext.setContain(contain);
            sheetContext.setSqlUtils(sqlUtils);
            sheetContext.setIsTable(isTable);
            sheetContext.setExcelHeaders(excelHeaders);
            sheetContext.setDashboardId(dashboardId);
            sheetContext.setWidgetId(widgetId);
            sheetContext.setName(name);
            sheetContext.setSheetNo(sheetNo);
            sheetContext.setWrapper(wrapper);
            sheetContext.setResultLimit(resultLimit);
            sheetContext.setTaskKey(taskKey);
            sheetContext.setCustomLogger(customLogger);
            return sheetContext;
        }
    }

    @Override
    public String toString() {
        return "SheetContext{" +
                "executeSql=" + executeSql +
                ", querySql=" + querySql +
                ", totalColumns=" + totalColumns +
                ", queryColumns=" + queryColumns +
                ", excludeColumns=" + excludeColumns +
                ", sheet=" + sheet +
                ", workbook=" + workbook +
                ", contain=" + contain +
                ", sqlUtils=" + sqlUtils +
                ", isTable=" + isTable +
                ", excelHeaders=" + excelHeaders +
                ", dashboardId=" + dashboardId +
                ", widgetId=" + widgetId +
                ", name='" + name + '\'' +
                ", sheetNo=" + sheetNo +
                ", wrapper=" + wrapper +
                ", resultLimit=" + resultLimit +
                ", taskKey='" + taskKey + '\'' +
                '}';
    }
}
