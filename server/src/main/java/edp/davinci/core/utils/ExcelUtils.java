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
import edp.core.exception.ServerException;
import edp.core.model.QueryColumn;
import edp.core.utils.FileUtils;
import edp.core.utils.SqlUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.core.enums.SqlColumnEnum;
import edp.davinci.core.model.DataUploadEntity;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.web.multipart.MultipartFile;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.text.DecimalFormat;
import java.util.*;

public class ExcelUtils {

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
     * @param cellStyle
     */
    public static void writeSheet(XSSFSheet sheet,
                                  List<QueryColumn> columns,
                                  List<Map<String, Object>> dataList,
                                  XSSFCellStyle cellStyle,
                                  boolean containType,
                                  String json) {

        boolean isTable = isTable(json);

        XSSFRow row = null;
        row = sheet.createRow(0);
        //header
        for (int i = 0; i < columns.size(); i++) {
            row.createCell(i).setCellValue(columns.get(i).getName());
        }

        //type
        if (containType) {
            row = sheet.createRow(1);
            for (int i = 0; i < columns.size(); i++) {
                String type = columns.get(i).getType();
                if (isTable) {
                    type = "VARCHAR";
                }
                row.createCell(i).setCellValue(type);
            }
        }

        Invocable invocable = null;
        if (isTable) {
            invocable = getInvocable();
        }

        //data
        for (int i = 0; i < dataList.size(); i++) {
            int rownum = i + 1;
            if (containType) {
                rownum += 1;
            }
            row = sheet.createRow(rownum);
            Map<String, Object> map = dataList.get(i);
            if (isTable(json)) {
                map = formatValue(invocable ,map, json);
            }

            for (int j = 0; j < columns.size(); j++) {
                Object obj = map.get(columns.get(j).getName());
                String v = "";
                if (null != obj) {
                    if (obj instanceof Double || obj instanceof Float) {
                        DecimalFormat decimalFormat = new DecimalFormat("#,###.####");
                        v = decimalFormat.format(obj);
                    } else {
                        v = obj.toString();
                    }
                }
                XSSFCell cell = row.createCell(j);
                cell.setCellValue(v);
                cell.setCellStyle(cellStyle);
            }
        }

        sheet.setDefaultRowHeight((short) (16.5 * 20));
        for (int i = 0; i < columns.size(); i++) {
            sheet.autoSizeColumn(i);
        }
    }


    private static Map<String, Object> formatValue(Invocable invocable ,Map<String, Object> map, String json) {
        try {
            Object obj = invocable.invokeFunction("test", map, json);
            if (obj instanceof HashMap) {
                return (Map<String, Object>)obj;
            }
        } catch (ScriptException e) {
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
        return map;
    }


    private static Invocable getInvocable() {
        FileReader fileReader = null;
        try {
            ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
            fileReader = new FileReader(Constants.TABLE_FORMAT_JS);
            engine.eval(fileReader);
            return (Invocable) engine;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (null != fileReader) {
                    fileReader.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return null;
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
