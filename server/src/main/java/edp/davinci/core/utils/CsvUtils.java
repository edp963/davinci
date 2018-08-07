package edp.davinci.core.utils;

import com.alibaba.druid.util.StringUtils;
import edp.core.exception.ServerException;
import edp.core.model.QueryColumn;
import edp.core.utils.SqlUtils;
import edp.davinci.core.enums.SqlColumnEnum;
import edp.davinci.core.model.CsvEntity;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.util.*;

public class CsvUtils {

    public static CsvEntity parseCsvWithFirstAsHeader(MultipartFile csvFile, String charsetName) throws ServerException {

        if (null == csvFile) {
            throw new ServerException("Invalid csv file");
        }

        if (!csvFile.getOriginalFilename().endsWith(".csv")) {
            throw new ServerException("Invalid csv file");
        }

        CsvEntity csvEntity = null;
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(csvFile.getInputStream(), charsetName));
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                    .withFirstRecordAsHeader()
                    .withIgnoreHeaderCase()
                    .withTrim());

            Set<String> csvHeaders = csvParser.getHeaderMap().keySet();

            List<CSVRecord> records = csvParser.getRecords();
            List<Map<String, Object>> values = null;
            Set<QueryColumn> headers = null;

            if (null != records && records.size() > 0) {
                headers = new HashSet<>();
                for (String key : csvHeaders) {
                    headers.add(new QueryColumn(key, SqlUtils.formatSqlType(records.get(0).get(key))));
                }
                if (records.size() > 1) {
                    values = new ArrayList<>();
                    for (int i = 1; i < records.size(); i++) {
                        Map<String, Object> item = new HashMap<>();
                        for (String key : csvHeaders) {
                            item.put(key, SqlColumnEnum.formatValue(records.get(0).get(key), records.get(i).get(key)));
                        }
                        values.add(item);
                    }
                }

                csvEntity = new CsvEntity();
                csvEntity.setHeaders(headers);
                csvEntity.setValues(values);
            }


            csvParser.close();
            reader.close();

        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

        return csvEntity;
    }

    public static String formatCsvWithFirstAsHeader(String filePath, String fileName, List<QueryColumn> columns, List<Map<String, Object>> dataList) throws ServerException {

        String csvFullName = null;
        if (null != columns && columns.size() > 0) {

            List<String> headers = new ArrayList<>();
            List<String> headerTypes = new ArrayList<>();
            for (QueryColumn column : columns) {
                headers.add(column.getName());
                headerTypes.add(column.getType());
            }

            if (!fileName.endsWith(".csv") && !fileName.endsWith(".CSV")) {
                fileName = fileName.trim() + ".csv";
            }

            if (!StringUtils.isEmpty(filePath)) {
                File dir = new File(filePath);
                if (!dir.exists() || !dir.isDirectory()) {
                    dir.mkdirs();
                }
            }

            File file = new File(filePath + File.separator + fileName);
            if (file.exists()) {
                fileName = fileName.substring(0, fileName.lastIndexOf(".") - 1) + "_" + UUID.randomUUID() + ".csv";
            }

            csvFullName = filePath + File.separator + fileName;

            FileWriter fileWriter = null;

            CSVPrinter csvPrinter = null;

            try {
                CSVFormat csvFormat = CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim();

                fileWriter = new FileWriter(csvFullName, true);

                csvPrinter = new CSVPrinter(fileWriter, csvFormat);

                csvPrinter.printRecord(headers);
                csvPrinter.printRecord(headerTypes);

                if (null != dataList && dataList.size() > 0) {
                    for (Map<String, Object> map : dataList) {
                        List<Object> list = new ArrayList<>();
                        for (String key : headers) {
                            list.add(map.get(key));
                        }
                        csvPrinter.printRecord(list);
                    }
                }

            } catch (Exception e) {
                e.printStackTrace();
                throw new ServerException(e.getMessage());
            } finally {
                try {
                    csvPrinter.flush();
                    fileWriter.flush();
                    fileWriter.close();
                    csvPrinter.close();
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new ServerException(e.getMessage());
                }
            }
        }
        return csvFullName;
    }
}
