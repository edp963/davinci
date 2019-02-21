/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2018 EDP
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

package edp.davinci.core.utils;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import edp.core.enums.SqlTypeEnum;
import edp.core.exception.ServerException;
import edp.core.model.QueryColumn;
import edp.core.utils.FileUtils;
import edp.core.utils.SqlUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.FieldFormatTypeEnum;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.core.enums.NumericUnitEnum;
import edp.davinci.core.enums.SqlColumnEnum;
import edp.davinci.core.model.*;
import edp.davinci.dto.viewDto.Param;
import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.web.multipart.MultipartFile;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static edp.core.consts.Consts.*;
import static edp.davinci.core.common.Constants.EXCEL_FORMAT_TYPE_KEY;

public class ExcelUtils {


    /**
     * 解析上传Excel
     *
     * @param excelFile
     * @return
     */
    public static DataUploadEntity parseExcelWithFirstAsHeader(MultipartFile excelFile) {

        if (null == excelFile) {
            throw new ServerException("Invalid excel file");
        }

        if (!FileUtils.isExcel(excelFile)) {
            throw new ServerException("Invalid excel file");
        }

        DataUploadEntity dataUploadEntity = null;

        Workbook workbook = null;

        try {
            workbook = getReadWorkbook(excelFile);

            //只读取第一个sheet页
            Sheet sheet = workbook.getSheetAt(0);

            //前两行表示列名和类型
            if (sheet.getLastRowNum() < 1) {
                throw new ServerException("empty excel");
            }
            //列
            Row headerRow = sheet.getRow(0);
            Row typeRow = sheet.getRow(1);

            List<Map<String, Object>> values = null;
            Set<QueryColumn> headers = new HashSet<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                try {
                    headers.add(new QueryColumn(headerRow.getCell(i).getStringCellValue(),
                            SqlUtils.formatSqlType(typeRow.getCell(i).getStringCellValue())));
                } catch (Exception e) {
                    e.printStackTrace();
                    if (e instanceof NullPointerException) {
                        throw new ServerException("Unknown Type");
                    }
                    throw new ServerException(e.getMessage());
                }
            }

            values = new ArrayList<>();
            for (int i = 2; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                Map<String, Object> item = new HashMap<>();
                for (int j = 0; j < headerRow.getLastCellNum(); j++) {
                    item.put(headerRow.getCell(j).getStringCellValue(),
                            SqlColumnEnum.formatValue(typeRow.getCell(j).getStringCellValue(), row.getCell(j).getStringCellValue()));
                }
                values.add(item);
            }

            dataUploadEntity = new DataUploadEntity();
            dataUploadEntity.setHeaders(headers);
            dataUploadEntity.setValues(values);

        } catch (ServerException e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

        return dataUploadEntity;
    }

    private static Workbook getReadWorkbook(MultipartFile excelFile) throws ServerException {
        InputStream inputStream = null;
        try {

            String originalFilename = excelFile.getOriginalFilename();
            inputStream = excelFile.getInputStream();
            if (originalFilename.toLowerCase().endsWith(FileTypeEnum.XLSX.getFormat())) {
                return new XSSFWorkbook(inputStream);
            } else if (originalFilename.toLowerCase().endsWith(FileTypeEnum.XLS.getFormat())) {
                return new HSSFWorkbook(inputStream);
            } else {
                throw new ServerException("Invalid excel file");
            }
        } catch (IOException e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        } finally {
            try {
                if (null != inputStream) {
                    inputStream.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
                throw new ServerException(e.getMessage());
            }
        }
    }


    /**
     * 写入数据到excel sheet页
     *
     * @param sheet
     * @param columns
     * @param dataList
     * @param workbook
     * @param params
     */
    public static void writeSheet(XSSFSheet sheet,
                                  List<QueryColumn> columns,
                                  List<Map<String, Object>> dataList,
                                  XSSFWorkbook workbook,
                                  boolean containType,
                                  String json,
                                  List<Param> params) {


        XSSFRow row = null;

        //默认格式
        XSSFCellStyle cellStyle = workbook.createCellStyle();
        XSSFCellStyle headerCellStyle = workbook.createCellStyle();


        XSSFDataFormat format = workbook.createDataFormat();

        //常规格式
        XSSFCellStyle generalStyle = workbook.createCellStyle();
        generalStyle.setDataFormat(format.getFormat("General"));

        //表头粗体居中
        XSSFFont font = workbook.createFont();
        font.setFontName("黑体");
        font.setBold(true);
        headerCellStyle.setFont(font);
        headerCellStyle.setDataFormat(format.getFormat("@"));
        headerCellStyle.setAlignment(HorizontalAlignment.CENTER);
        headerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        boolean isTable = isTable(json);

        ScriptEngine engine = null;
        List<ExcelHeader> excelHeaders = null;
        if (isTable) {
            try {
                engine = getScriptEngine();
                excelHeaders = formatHeader(engine, json, params);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        int rownum = 0;


        //用于记录表头对应数据格式
        Map<String, XSSFCellStyle> headerFormatMap = null;
        //用于标记标记数字格式单位
        Map<String, NumericUnitEnum> dataUnitMap = null;

        //记录列最大字符数
        Map<String, Integer> columnWidthMap = new HashMap<>();

        //header
        if (isTable && null != excelHeaders && excelHeaders.size() > 0) {

            headerFormatMap = new HashMap<>();
            dataUnitMap = new HashMap<>();

            int colnum = 0;

            List<QueryColumn> columnList = new ArrayList<>();
            for (ExcelHeader excelHeader : excelHeaders) {
                if (excelHeader.getRow() + 1 > rownum) {
                    rownum = excelHeader.getRow();
                }
                if (excelHeader.getCol() + 1 > colnum) {
                    colnum = excelHeader.getCol();
                }

                //调整数据渲染顺序
                for (QueryColumn queryColumn : columns) {
                    if (queryColumn.getName().equals(excelHeader.getKey())) {
                        queryColumn.setType(excelHeader.getType());
                        columnList.add(queryColumn);
                        columnWidthMap.put(queryColumn.getName(), queryColumn.getName().getBytes().length >= queryColumn.getType().getBytes().length ?
                                queryColumn.getName().getBytes().length : queryColumn.getType().getBytes().length);

                        //获取对应数据格式
                        if (null != excelHeader.getFormat()) {

                            Object o = excelHeader.getFormat();
                            //标记数组和货币数值的单位
                            if (o instanceof FieldNumeric || o instanceof FieldCurrency) {
                                FieldNumeric fieldNumeric = (FieldNumeric) o;
                                if (null != fieldNumeric.getUnit()) {
                                    dataUnitMap.put(excelHeader.getKey(), fieldNumeric.getUnit());
                                }
                            }

                            //生成excel数据格式
                            String dataFormat = getDataFormat(excelHeader.getFormat());
                            if (!StringUtils.isEmpty(dataFormat)) {
                                XSSFCellStyle dataStyle = workbook.createCellStyle();
                                XSSFDataFormat xssfDataFormat = workbook.createDataFormat();
                                dataStyle.setDataFormat(xssfDataFormat.getFormat(dataFormat));
                                headerFormatMap.put(queryColumn.getName(), dataStyle);
                            }
                        }
                    }
                }
            }

            if (null != columnList && columnList.size() > 0) {
                columns = columnList;
            }

            //画出表头
            for (int i = 0; i < rownum + 1; i++) {
                XSSFRow headerRow = sheet.createRow(i);
                for (int j = 0; j <= colnum; j++) {
                    headerRow.createCell(j);
                }
            }

            for (ExcelHeader excelHeader : excelHeaders) {

                //合并单元格
                if (excelHeader.isMerged() && null != excelHeader.getRange() && excelHeader.getRange().length == 4) {
                    int[] range = excelHeader.getRange();
                    if (!(range[0] == range[1] && range[2] == range[3])) {
                        CellRangeAddress cellRangeAddress = new CellRangeAddress(range[0], range[1], range[2], range[3]);
                        sheet.addMergedRegion(cellRangeAddress);
                    }
                }
                XSSFCell cell = sheet.getRow(excelHeader.getRow()).getCell(excelHeader.getCol());
                cell.setCellStyle(headerCellStyle);
                cell.setCellValue(StringUtils.isEmpty(excelHeader.getAlias()) ? excelHeader.getKey() : excelHeader.getAlias());
            }

        } else {
            row = sheet.createRow(rownum);
            for (int i = 0; i < columns.size(); i++) {
                QueryColumn queryColumn = columns.get(i);

                columnWidthMap.put(queryColumn.getName(), queryColumn.getName().getBytes().length >= queryColumn.getType().getBytes().length ?
                        queryColumn.getName().getBytes().length : queryColumn.getType().getBytes().length);

                XSSFCell cell = row.createCell(i);
                cell.setCellStyle(headerCellStyle);
                cell.setCellValue(queryColumn.getName());
            }
        }

        //type
        if (containType) {
            rownum++;
            row = sheet.createRow(rownum);
            for (int i = 0; i < columns.size(); i++) {
                String type = columns.get(i).getType();
                if (isTable) {
                    type = SqlTypeEnum.VARCHAR.getName();
                }
                row.createCell(i).setCellValue(type);
            }
        }


        //data
        for (int i = 0; i < dataList.size(); i++) {
            rownum++;
            if (containType) {
                rownum += 1;
            }
            row = sheet.createRow(rownum);
            Map<String, Object> map = dataList.get(i);

            for (int j = 0; j < columns.size(); j++) {
                QueryColumn queryColumn = columns.get(j);
                cellStyle.setDataFormat(format.getFormat("@"));
                Object obj = map.get(queryColumn.getName());
                XSSFCell cell = row.createCell(j);
                if (null != obj) {
                    if (obj instanceof Number || queryColumn.getType().equals("value")) {
                        try {
                            Double d = Double.parseDouble(String.valueOf(obj));

                            if (null != dataUnitMap && dataUnitMap.containsKey(queryColumn.getName())) {
                                NumericUnitEnum numericUnitEnum = dataUnitMap.get(queryColumn.getName());
                                //如果单位为"万"和"亿"，格式按照"k"和"M"，数据上除10计算渲染
                                switch (numericUnitEnum) {
                                    case TenThousand:
                                    case OneHundredMillion:
                                        d = d / 10;
                                        break;
                                    default:
                                        break;
                                }
                            }
                            cell.setCellValue(d);
                        } catch (NumberFormatException e) {
                            cell.setCellValue(String.valueOf(obj));
                        }
                        if (null != headerFormatMap && headerFormatMap.containsKey(queryColumn.getName())) {
                            cell.setCellStyle(headerFormatMap.get(queryColumn.getName()));
                        } else {
                            cell.setCellStyle(generalStyle);
                        }
                    } else {
                        cell.setCellValue(String.valueOf(obj));
                    }

                    if (columnWidthMap.containsKey(queryColumn.getName())) {
                        if (String.valueOf(obj).getBytes().length > columnWidthMap.get(queryColumn.getName())) {
                            columnWidthMap.put(queryColumn.getName(), String.valueOf(obj).getBytes().length);
                        }
                    }

                } else {
                    cell.setCellValue("");
                    cell.setCellStyle(cellStyle);
                }
            }
        }

        sheet.setDefaultRowHeight((short) (20 * 20));
        for (int i = 0; i < columns.size(); i++) {
            sheet.autoSizeColumn(i, true);

            QueryColumn queryColumn = columns.get(i);
            if (columnWidthMap.containsKey(queryColumn.getName())) {
                Integer width = columnWidthMap.get(queryColumn.getName());
                if (width > 0) {
                    sheet.setColumnWidth(i, width * 256);
                }
            } else {
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) * 12 / 10);
            }
        }
    }

    /**
     * 获取数据Excel格式
     *
     * @param fieldTypeObject
     * @return
     */
    public static String getDataFormat(Object fieldTypeObject) {
        if (null != fieldTypeObject) {
            String formatExpr = "@";
            if (fieldTypeObject instanceof FieldCurrency || fieldTypeObject instanceof FieldNumeric) {
                FieldNumeric fieldNumeric = (FieldNumeric) fieldTypeObject;
                StringBuilder fmtSB = new StringBuilder();

                if (fieldTypeObject instanceof FieldCurrency) {
                    FieldCurrency fieldCurrency = (FieldCurrency) fieldTypeObject;
                    fmtSB.append(fieldCurrency.getPrefix());
                }

                fmtSB.append(octothorpe);

                if (fieldNumeric.isUseThousandSeparator()) {
                    fmtSB.append(conditionSeparator)
                            .append(makeNTimesString(2, octothorpe))
                            .append("0");
                }

                String nzero = makeNTimesString(fieldNumeric.getDecimalPlaces(), 0);
                if (!StringUtils.isEmpty(nzero)) {
                    fmtSB.append(".").append(nzero);
                }

                if (null != fieldNumeric.getUnit() && !StringUtils.isEmpty(getUnitExpr(fieldNumeric))) {
                    fmtSB.append(getUnitExpr(fieldNumeric));
                }

                if (fieldTypeObject instanceof FieldCurrency) {
                    FieldCurrency fieldCurrency = (FieldCurrency) fieldTypeObject;
                    fmtSB.append(fieldCurrency.getSuffix());
                }

                formatExpr = fmtSB.toString();

            } else if (fieldTypeObject instanceof FieldCustom) {

            } else if (fieldTypeObject instanceof FieldDate) {

                FieldCustom fieldCustom = (FieldCustom) fieldTypeObject;
                formatExpr = fieldCustom.getFormat().toLowerCase();

            } else if (fieldTypeObject instanceof FieldPercentage) {
                FieldPercentage fieldPercentage = (FieldPercentage) fieldTypeObject;

                StringBuilder fmtSB = new StringBuilder("0");
                if (fieldPercentage.getDecimalPlaces() > 0) {
                    fmtSB.append(".").append(makeNTimesString(fieldPercentage.getDecimalPlaces(), 0));

                }
                fmtSB.append(percentSign);

                formatExpr = fmtSB.toString();

            } else if (fieldTypeObject instanceof FieldScientificNotation) {
                FieldScientificNotation fieldScientificNotation = (FieldScientificNotation) fieldTypeObject;
                StringBuilder fmtSB = new StringBuilder("0");
                if (fieldScientificNotation.getDecimalPlaces() > 0) {
                    fmtSB.append(".")
                            .append(makeNTimesString(fieldScientificNotation.getDecimalPlaces(), 0));
                }
                fmtSB.append("E+00");
                formatExpr = fmtSB.toString();

            }

            return formatExpr;
        }

        return null;
    }


    /**
     * 根据单位获取Excel格式表达式
     *
     * @param fieldNumeric
     * @return
     */
    private static String getUnitExpr(FieldNumeric fieldNumeric) {
        String unitExpr = null;
        switch (fieldNumeric.getUnit()) {
            case None:
                break;
            case Thousand:
            case TenThousand:
                unitExpr = conditionSeparator + "\"" + fieldNumeric.getUnit().getUnit() + "\"";
                break;
            case Million:
            case OneHundredMillion:
                unitExpr = makeNTimesString(2, conditionSeparator) + "\"" + fieldNumeric.getUnit().getUnit() + "\"";
                break;
            case Giga:
                unitExpr = makeNTimesString(3, conditionSeparator) + "\"" + fieldNumeric.getUnit().getUnit() + "\"";
                break;

            default:
                break;
        }

        return unitExpr;
    }


    private static String makeNTimesString(int n, Object s) {
        return IntStream.range(0, n).mapToObj(i -> String.valueOf(s)).collect(Collectors.joining(""));
    }


    /**
     * format cell value
     *
     * @param engine
     * @param list
     * @param json
     * @return
     */
    private static List<Map<String, Object>> formatValue(ScriptEngine engine, List<Map<String, Object>> list, String json) {
        try {
            Invocable invocable = (Invocable) engine;
            Object obj = invocable.invokeFunction("getFormattedDataRows", json, list);

            if (obj instanceof ScriptObjectMirror) {
                ScriptObjectMirror som = (ScriptObjectMirror) obj;
                if (som.isArray()) {
                    final List<Map<String, Object>> convertList = new ArrayList<>();
                    Collection<Object> values = som.values();
                    values.forEach(v -> {
                        Map<String, Object> map = new HashMap<>();
                        ScriptObjectMirror vsom = (ScriptObjectMirror) v;
                        for (String key : vsom.keySet()) {
                            map.put(key, vsom.get(key));
                        }
                        convertList.add(map);
                    });
                    return convertList;
                }
            }

        } catch (ScriptException e) {
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }

        return list;
    }

    /**
     * 格式化表头
     * @param engine
     * @param json
     * @param params
     * @return
     */
    private static List<ExcelHeader> formatHeader(ScriptEngine engine, String json, List<Param> params) {
        try {
            Invocable invocable = (Invocable) engine;
            Object obj = invocable.invokeFunction("getFieldsHeader", json, params);

            if (obj instanceof ScriptObjectMirror) {
                ScriptObjectMirror som = (ScriptObjectMirror) obj;
                if (som.isArray()) {
                    final List<ExcelHeader> excelHeaders = new ArrayList<>();
                    Collection<Object> values = som.values();
                    values.forEach(v -> {
                        ExcelHeader header = new ExcelHeader();
                        ScriptObjectMirror vsom = (ScriptObjectMirror) v;
                        for (String key : vsom.keySet()) {
                            if (!StringUtils.isEmpty(key)) {
                                String setter = "set" + String.valueOf(key.charAt(0)).toUpperCase() + key.substring(1);
                                Object o = vsom.get(key);
                                Class clazz = o.getClass();

                                try {
                                    if (o instanceof ScriptObjectMirror) {
                                        ScriptObjectMirror mirror = (ScriptObjectMirror) o;
                                        if ("range".equals(key)) {
                                            if (mirror.isArray()) {
                                                int[] array = new int[4];
                                                for (int i = 0; i < 4; i++) {
                                                    array[i] = Integer.parseInt(mirror.get(i + "").toString());
                                                }
                                                header.setRange(array);
                                            }
                                        } else if ("style".equals(key)) {
                                            if (mirror.isArray()) {
                                                List<String> list = new ArrayList<>();
                                                for (int i = 0; i < 4; i++) {
                                                    list.add(mirror.get(i + "").toString());
                                                }
                                                header.setStyle(list);
                                            }
                                        } else if ("format".equals(key)) {
                                            String formatType = mirror.get(EXCEL_FORMAT_TYPE_KEY).toString();
                                            ScriptObjectMirror format = (ScriptObjectMirror) mirror.get(formatType);

                                            if (null != format) {
                                                FieldFormatTypeEnum typeEnum = FieldFormatTypeEnum.typeOf(formatType);
                                                ObjectMapper mapper = new ObjectMapper();

                                                NumericUnitEnum numericUnit = null;
                                                if (format.containsKey("unit")) {
                                                    numericUnit = NumericUnitEnum.unitOf(String.valueOf(format.get("unit")));
                                                }

                                                switch (typeEnum) {
                                                    case Currency:
                                                        FieldCurrency fieldCurrency = mapper.convertValue(format, FieldCurrency.class);
                                                        if (null != fieldCurrency) {
                                                            fieldCurrency.setUnit(numericUnit);
                                                            header.setFormat(fieldCurrency);
                                                        }
                                                        break;
                                                    case Custom:
                                                        FieldCustom fieldCustom = mapper.convertValue(format, FieldCustom.class);
                                                        header.setFormat(fieldCustom);
                                                        break;
                                                    case Date:
                                                        FieldDate fieldDate = mapper.convertValue(format, FieldDate.class);
                                                        header.setFormat(fieldDate);

                                                        break;
                                                    case Numeric:
                                                        FieldNumeric fieldNumeric = mapper.convertValue(format, FieldNumeric.class);
                                                        fieldNumeric.setUnit(numericUnit);
                                                        header.setFormat(fieldNumeric);

                                                        break;
                                                    case Percentage:
                                                        FieldPercentage fieldPercentage = mapper.convertValue(format, FieldPercentage.class);
                                                        header.setFormat(fieldPercentage);

                                                        break;
                                                    case ScientificNotation:
                                                        FieldScientificNotation scientificNotation = mapper.convertValue(format, FieldScientificNotation.class);
                                                        header.setFormat(scientificNotation);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                            }
                                        }

                                    } else {
                                        Method method = header.getClass().getMethod(setter, clazz);
                                        method.invoke(header, vsom.get(key));
                                    }
                                } catch (NoSuchMethodException e) {
                                    e.printStackTrace();
                                } catch (IllegalAccessException e) {
                                    e.printStackTrace();
                                } catch (InvocationTargetException e) {
                                    e.printStackTrace();
                                } finally {
                                    continue;
                                }
                            }
                        }
                        excelHeaders.add(header);
                    });
                    return excelHeaders;
                }
            }

        } catch (ScriptException e) {
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
        return null;
    }


    private static ScriptEngine getScriptEngine() throws Exception {
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
        ClassLoader classLoader = ExcelUtils.class.getClassLoader();
        engine.eval(new InputStreamReader(classLoader.getResourceAsStream(Constants.TABLE_FORMAT_JS)));
        return engine;
    }


    private static boolean isTable(String json) {
        if (!StringUtils.isEmpty(json)) {
            try {
                JSONObject jsonObject = JSONObject.parseObject(json);
                if (null != jsonObject) {
                    if (jsonObject.containsKey("selectedChart") && jsonObject.containsKey("mode")) {
                        Integer selectedChart = jsonObject.getInteger("selectedChart");
                        String mode = jsonObject.getString("mode");
                        if (selectedChart.equals(1) && mode.equals("chart")) {
                            return true;
                        }
                    }
                }
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }
}
