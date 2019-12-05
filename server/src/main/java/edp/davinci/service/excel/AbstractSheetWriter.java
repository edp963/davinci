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

import com.alibaba.druid.util.StringUtils;
import edp.core.enums.SqlTypeEnum;
import edp.core.model.QueryColumn;
import edp.core.utils.CollectionUtils;
import edp.davinci.core.enums.NumericUnitEnum;
import edp.davinci.core.model.ExcelHeader;
import edp.davinci.core.model.FieldCurrency;
import edp.davinci.core.model.FieldNumeric;
import edp.davinci.core.utils.ExcelUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.EMPTY;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 18:24
 * To change this template use File | Settings | File Templates.
 */
@Slf4j
public abstract class AbstractSheetWriter {

    private CellStyle header;

    private CellStyle myDefault;

    private CellStyle general;

    private DataFormat format;

    private int nextRowNum = 0;

    //用于记录表头对应数据格式
    Map<String, CellStyle> headerFormatMap = new HashMap();
    //用于标记标记数字格式单位
    Map<String, NumericUnitEnum> dataUnitMap = new HashMap();
    //记录列最大字符数
    Map<String, Integer> columnWidthMap = new HashMap();


    protected void init(SheetContext context) throws Exception {
        format = context.getWorkbook().createDataFormat();
        //默认格式
        myDefault = context.getWorkbook().createCellStyle();
        //常规格式
        general = context.getWorkbook().createCellStyle();
        general.setDataFormat(format.getFormat("General"));
        //表头格式 粗体居中
        header = context.getWorkbook().createCellStyle();
        Font font = context.getWorkbook().createFont();
        font.setFontName("黑体");
        font.setBoldweight(Font.BOLDWEIGHT_BOLD);
        header.setFont(font);
        header.setDataFormat(format.getFormat("@"));
        header.setAlignment(CellStyle.ALIGN_CENTER);
        header.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
    }

    protected void writeHeader(SheetContext context) throws Exception {
        if (context.getIsTable() && !CollectionUtils.isEmpty(context.getExcelHeaders())) {
            int rownum = 0;
            int colnum = 0;
            Map<String, QueryColumn> columnMap = context.getQueryColumns().stream().collect(Collectors.toMap(x -> x.getName(), x -> x));
            List<QueryColumn> queryColumns = new ArrayList<>();
            for (ExcelHeader excelHeader : context.getExcelHeaders()) {
                //计算多级表头行
                if (excelHeader.getRow() + excelHeader.getRowspan() > rownum) {
                    rownum = excelHeader.getRow() + excelHeader.getRowspan();
                }
                //计算多级表头列
                if (excelHeader.getCol() + excelHeader.getColspan() > colnum) {
                    colnum = excelHeader.getCol() + excelHeader.getColspan();
                }
                if (columnMap.containsKey(excelHeader.getKey())) {
                    QueryColumn queryColumn = columnMap.get(excelHeader.getKey());
                    queryColumns.add(queryColumn);
                    queryColumn.setType(excelHeader.getType());
                    //设置列的最大长度
                    columnWidthMap.put(queryColumn.getName(), Math.max(queryColumn.getName().getBytes().length, queryColumn.getType().getBytes().length));
                }
                //获取对应数据格式
                if (null != excelHeader.getFormat()) {
                    Object o = excelHeader.getFormat();
                    //设置列货币数值的单位
                    if (o instanceof FieldNumeric || o instanceof FieldCurrency) {
                        FieldNumeric fieldNumeric = (FieldNumeric) o;
                        if (null != fieldNumeric.getUnit()) {
                            dataUnitMap.put(excelHeader.getKey(), fieldNumeric.getUnit());
                        }
                    }
                    //设置列数据格式
                    String dataFormat = ExcelUtils.getDataFormat(excelHeader.getFormat());
                    if (!StringUtils.isEmpty(dataFormat)) {
                        CellStyle dataStyle = context.getWorkbook().createCellStyle();
                        DataFormat xssfDataFormat = context.getWorkbook().createDataFormat();
                        dataStyle.setDataFormat(xssfDataFormat.getFormat(dataFormat));
                        headerFormatMap.put(excelHeader.getKey(), dataStyle);
                    }
                }
            }
            if (!CollectionUtils.isEmpty(queryColumns)) {
                context.setQueryColumns(queryColumns);
            }
            //画出表头
            for (int i = 0; i < rownum; i++) {
                Row headerRow = context.getSheet().createRow(i);
                nextRowNum++;
                for (int j = 0; j < colnum; j++) {
                    headerRow.createCell(j);
                }
            }
            for (ExcelHeader excelHeader : context.getExcelHeaders()) {
                //合并单元格
                if (excelHeader.isMerged() && null != excelHeader.getRange() && excelHeader.getRange().length == 4) {
                    int[] range = excelHeader.getRange();
                    if (!(range[0] == range[1] && range[2] == range[3])) {
                        CellRangeAddress cellRangeAddress = new CellRangeAddress(range[0], range[1], range[2], range[3]);
                        context.getSheet().addMergedRegion(cellRangeAddress);
                    }
                }
                Cell cell = context.getSheet().getRow(excelHeader.getRow()).getCell(excelHeader.getCol());
                cell.setCellStyle(header);
                cell.setCellValue(StringUtils.isEmpty(excelHeader.getAlias()) ? excelHeader.getKey() : excelHeader.getAlias());
            }
        } else {
            Row row = context.getSheet().createRow(nextRowNum++);
            for (int i = 0; i < context.getQueryColumns().size(); i++) {
                QueryColumn queryColumn = context.getQueryColumns().get(i);
                columnWidthMap.put(queryColumn.getName(), Math.max(queryColumn.getName().getBytes().length, queryColumn.getType().getBytes().length));
                Cell cell = row.createCell(i);
                cell.setCellStyle(header);
                cell.setCellValue(queryColumn.getName());
            }
        }
        //添加数据类型行
        if (context.getContain()) {
            Row row = context.getSheet().createRow(nextRowNum++);
            for (int i = 0; i < context.getQueryColumns().size(); i++) {
                String type = context.getQueryColumns().get(i).getType();
                if (context.getIsTable()) {
                    type = SqlTypeEnum.VARCHAR.getName();
                }
                row.createCell(i).setCellValue(type);
            }
        }
    }

    protected void writeLine(SheetContext context, Map<String, Object> dataMap) {
        Row row = context.getSheet().createRow(nextRowNum++);
        for (int j = 0; j < context.getQueryColumns().size(); j++) {
            QueryColumn queryColumn = context.getQueryColumns().get(j);
            myDefault.setDataFormat(format.getFormat("@"));
            Object value = dataMap.get(queryColumn.getName());
            Cell cell = row.createCell(j);
            if (null != value) {
                if (value instanceof Number || queryColumn.getType().equals("value")) {

                    Double v = formatNumber(value, dataUnitMap.get(queryColumn.getName()));

                    if (v == null) {
                        cell.setCellValue(String.valueOf(value));
                    } else {
                        cell.setCellValue(v);
                    }

                    if (null != headerFormatMap && headerFormatMap.containsKey(queryColumn.getName())) {
                        cell.setCellStyle(headerFormatMap.get(queryColumn.getName()));
                    } else {
                        cell.setCellStyle(general);
                    }
                } else {
                    cell.setCellValue(String.valueOf(value));
                }

                if (columnWidthMap.containsKey(queryColumn.getName())) {
                    if (String.valueOf(value).getBytes().length > columnWidthMap.get(queryColumn.getName())) {
                        columnWidthMap.put(queryColumn.getName(), String.valueOf(value).getBytes().length);
                    }
                }
            } else {
                cell.setCellValue(EMPTY);
                cell.setCellStyle(myDefault);
            }
        }
    }

    protected void writeBody(SheetContext context) {
    }

    protected Boolean refreshHeightWidth(SheetContext context) {
        context.getSheet().setDefaultRowHeight((short) (20 * 20));
        for (int i = 0; i < context.getQueryColumns().size(); i++) {
            context.getSheet().autoSizeColumn(i, true);
            QueryColumn queryColumn = context.getQueryColumns().get(i);
            if (columnWidthMap.containsKey(queryColumn.getName())) {
                int width = columnWidthMap.get(queryColumn.getName());
                if (width > 0) {
                    width = width > 255 ? 255 : width;
                    context.getSheet().setColumnWidth(i, width * 256);
                }
            } else {
                context.getSheet().setColumnWidth(i, context.getSheet().getColumnWidth(i) * 12 / 10);
            }
        }
        return true;
    }


    private Double formatNumber(Object value, NumericUnitEnum unitEnum) {
        try {
            Double d = Double.parseDouble(String.valueOf(value));

            if (null == unitEnum) {
                return d;
            }

            //如果单位为"万"和"亿"，格式按照"k"和"M"，数据上除10计算渲染
            switch (unitEnum) {
                case TenThousand:
                case OneHundredMillion:
                    d = d / 10;
                    break;
                default:
                    break;
            }
            return d;
        } catch (NumberFormatException e) {
        }
        return null;
    }
}
