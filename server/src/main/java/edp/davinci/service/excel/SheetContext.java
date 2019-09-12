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
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;

import java.io.Serializable;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 18:21
 * To change this template use File | Settings | File Templates.
 */
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

    private SheetContext(List<String> executeSql,
                         List<String> querySql,
                         List<QueryColumn> totalColumns,
                         List<QueryColumn> queryColumns,
                         List<String> excludeColumns,
                         Sheet sheet,
                         Workbook workbook,
                         Boolean contain,
                         SqlUtils sqlUtils,
                         Boolean isTable,
                         List<ExcelHeader> excelHeaders,
                         Long dashboardId,
                         Long widgetId,
                         String name,
                         int sheetNo,
                         MsgWrapper wrapper,
                         int resultLimit) {
        this.executeSql = executeSql;
        this.querySql = querySql;
        this.totalColumns = totalColumns;
        this.queryColumns = queryColumns;
        this.excludeColumns = excludeColumns;
        this.sheet = sheet;
        this.workbook = workbook;
        this.contain = contain;
        this.sqlUtils = sqlUtils;
        this.isTable = isTable;
        this.excelHeaders = excelHeaders;
        this.dashboardId = dashboardId;
        this.widgetId = widgetId;
        this.name = name;
        this.sheetNo = sheetNo;
        this.wrapper = wrapper;
        this.resultLimit = resultLimit;
    }

    public static SheetContextBuilder newSheetContextBuilder() {
        return new SheetContext.SheetContextBuilder();
    }

    public List<String> getExecuteSql() {
        return executeSql;
    }

    public void setExecuteSql(List<String> executeSql) {
        this.executeSql = executeSql;
    }

    public List<String> getQuerySql() {
        return querySql;
    }

    public void setQuerySql(List<String> querySql) {
        this.querySql = querySql;
    }

    public List<QueryColumn> getTotalColumns() {
        return totalColumns;
    }

    public void setTotalColumns(List<QueryColumn> totalColumns) {
        this.totalColumns = totalColumns;
    }

    public List<QueryColumn> getQueryColumns() {
        return queryColumns;
    }

    public void setQueryColumns(List<QueryColumn> queryColumns) {
        this.queryColumns = queryColumns;
    }

    public List<String> getExcludeColumns() {
        return excludeColumns;
    }

    public void setExcludeColumns(List<String> excludeColumns) {
        this.excludeColumns = excludeColumns;
    }

    public Sheet getSheet() {
        return sheet;
    }

    public void setSheet(Sheet sheet) {
        this.sheet = sheet;
    }

    public Workbook getWorkbook() {
        return workbook;
    }

    public void setWorkbook(Workbook workbook) {
        this.workbook = workbook;
    }

    public Boolean getContain() {
        return contain;
    }

    public void setContain(Boolean contain) {
        this.contain = contain;
    }

    public SqlUtils getSqlUtils() {
        return sqlUtils;
    }

    public void setSqlUtils(SqlUtils sqlUtils) {
        this.sqlUtils = sqlUtils;
    }

    public Boolean getTable() {
        return isTable;
    }

    public void setTable(Boolean table) {
        isTable = table;
    }

    public List<ExcelHeader> getExcelHeaders() {
        return excelHeaders;
    }

    public void setExcelHeaders(List<ExcelHeader> excelHeaders) {
        this.excelHeaders = excelHeaders;
    }

    public Long getDashboardId() {
        return dashboardId;
    }

    public void setDashboardId(Long dashboardId) {
        this.dashboardId = dashboardId;
    }

    public Long getWidgetId() {
        return widgetId;
    }

    public void setWidgetId(Long widgetId) {
        this.widgetId = widgetId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getSheetNo() {
        return sheetNo;
    }

    public void setSheetNo(int sheetNo) {
        this.sheetNo = sheetNo;
    }

    public MsgWrapper getWrapper() {
        return wrapper;
    }

    public void setWrapper(MsgWrapper wrapper) {
        this.wrapper = wrapper;
    }

    public int getResultLimit() {
        return resultLimit;
    }

    public void setResultLimit(int resultLimit) {
        this.resultLimit = resultLimit;
    }

    @Override
    public String toString() {
        return "SheetContext{" +
                "executeSql=" + executeSql +
                ", querySql=" + querySql +
                ", totalColumns=" + totalColumns +
                ", queryColumns=" + queryColumns +
                ", excludeColumns=" + excludeColumns +
                ", sheet=" + sheet.getSheetName() +
                ", contain=" + contain +
                ", isTable=" + isTable +
                ", excelHeaders=" + excelHeaders +
                ", dashboardId=" + dashboardId +
                ", widgetId=" + widgetId +
                ", name='" + name + '\'' +
                ", sheetNo=" + sheetNo +
                ", wrapper=" + wrapper +
                '}';
    }

    public static class SheetContextBuilder implements Serializable {
        private List<String> executeSql;
        private List<String> querySql;
        List<String> excludeColumns;
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

        public SheetContextBuilder() {
        }

        public SheetContextBuilder buildExecuteSql(List<String> executeSql) {
            this.executeSql = executeSql;
            return this;
        }

        public SheetContextBuilder buildQuerySql(List<String> querySql) {
            this.querySql = querySql;
            return this;
        }

        public SheetContextBuilder buildExcludeColumns(List<String> excludeColumns) {
            this.excludeColumns = excludeColumns;
            return this;
        }


        public SheetContextBuilder buildSheet(Sheet sheet) {
            this.sheet = sheet;
            return this;
        }

        public SheetContextBuilder buildWorkbook(Workbook workbook) {
            this.workbook = workbook;
            return this;
        }

        public SheetContextBuilder buildContain(Boolean contain) {
            this.contain = contain;
            return this;
        }

        public SheetContextBuilder buildSqlUtils(SqlUtils sqlUtils) {
            this.sqlUtils = sqlUtils;
            return this;
        }

        public SheetContextBuilder buildIsTable(Boolean isTable) {
            this.isTable = isTable;
            return this;
        }

        public SheetContextBuilder buildHeaders(List<ExcelHeader> headers) {
            this.excelHeaders = headers;
            return this;
        }

        public SheetContextBuilder buildDashboardId(Long dashboardId) {
            this.dashboardId = dashboardId;
            return this;
        }

        public SheetContextBuilder buildWidgetId(Long widgetId) {
            this.widgetId = widgetId;
            return this;
        }

        public SheetContextBuilder buildName(String name) {
            this.name = name;
            return this;
        }

        public SheetContextBuilder buildSheetNo(int sheetNo) {
            this.sheetNo = sheetNo;
            return this;
        }

        public SheetContextBuilder buildWrapper(MsgWrapper wrapper) {
            this.wrapper = wrapper;
            return this;
        }

        public SheetContextBuilder buildResultLimist(int resultLimit) {
            this.resultLimit = resultLimit;
            return this;
        }


        public SheetContext build() {
            return new SheetContext(
                    this.executeSql,
                    this.querySql,
                    null,
                    null,
                    this.excludeColumns,
                    this.sheet,
                    this.workbook,
                    this.contain,
                    this.sqlUtils,
                    this.isTable,
                    this.excelHeaders,
                    this.dashboardId,
                    this.widgetId,
                    this.name,
                    this.sheetNo,
                    this.wrapper,
                    this.resultLimit
            );
        }


    }
}
