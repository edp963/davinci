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

package edp.davinci.core.enums;

import com.alibaba.druid.util.StringUtils;
import edp.core.exception.ServerException;
import edp.core.utils.DateUtils;

import javax.sql.rowset.serial.SerialBlob;
import javax.sql.rowset.serial.SerialClob;
import java.math.BigDecimal;
import java.sql.SQLException;

import static edp.core.consts.Consts.EMPTY;

public enum SqlColumnEnum {

    TINYINT("TINYINT", "Short"),
    SMALLINT("SMALLINT", "Short"),
    INT("INT", "Integer"),
    INTEGER("INTEGER", "Integer"),
    BIGINT("BIGINT", "Long"),
    DECIMAL("DECIMAL", "BigDecimal"),
    NUMERIC("NUMERIC", "BigDecimal"),
    REAL("REAL", "Float"),
    FLOAT("FLOAT", "Float"),
    DOUBLE("DOUBLE", "Double"),
    CHAR("CHAR", "String"),
    VARCHAR("VARCHAR", "String"),
    NVARCHAR("NVARCHAR", "String"),
    LONGVARCHAR("LONGVARCHAR", "String"),
    LONGNVARCHAR("LONGNVARCHAR", "String"),
    TEXT("TEXT", "String"),
    BOOLEAN("BOOLEAN", "Boolean"),
    BIT("BIT", "Boolean"),
    BINARY("BINARY", "Bytes"),
    VARBINARY("VARBINARY", "Bytes"),
    LONGVARBINARY("LONGVARBINARY", "Bytes"),
    DATE("DATE", "Date"),
    DATETIME("DATETIME", "DateTime"),
    TIMESTAMP("TIMESTAMP", "Timestamp"),
    BLOB("BLOB", "Blob"),
    CLOB("CLOB", "Clob");

    private String type;
    private String value;

    SqlColumnEnum(String type, String value) {
        this.type = type;
        this.value = value;
    }

    public static Object formatValue(String type, String value) throws ServerException {
        type = type.toUpperCase();
        for (SqlColumnEnum sqlTypeEnum : values()) {
            if (sqlTypeEnum.type.equals(type)) {
                Object object = null;
                try {
                    object = s2dbValue(type, value);
                } catch (Exception e) {
                    throw new ServerException(e.toString() + ":[" + type + ":" + value + "]");
                }
                return object;
            }
        }
        return value;
    }

    public static String toJavaType(String type) throws ServerException {
        type = type.toUpperCase();
        int i = type.indexOf("(");
        if (i > 0) {
            type = type.substring(0, i);
        }
        for (SqlColumnEnum sqlTypeEnum : values()) {
            if (sqlTypeEnum.type.equals(type)) {
                return sqlTypeEnum.value;
            }
        }
        return null;
    }

    private static Object s2dbValue(String type, String value) throws Exception {
        if (StringUtils.isEmpty(value)) {
            return null;
        }
        Object result = value.trim();
        switch (type.toUpperCase()) {
            case "TINYINT":
            case "SMALLINT":
                result = Short.parseShort(value.trim());
                break;

            case "INT":
            case "INTEGER":
                result = Integer.parseInt(value.trim());
                break;

            case "BIGINT":
                result = Long.parseLong(value.trim());
                break;

            case "DECIMAL":
            case "NUMERIC":
                if (EMPTY.equals(value.trim())) {
                    result = new BigDecimal("0.0").stripTrailingZeros();
                } else {
                    result = new BigDecimal(value.trim()).stripTrailingZeros();
                }
                break;

            case "FLOAT":
            case "REAL":
                result = Float.parseFloat(value.trim());
                break;

            case "DOUBLE":
                result = Double.parseDouble(value.trim());
                break;

            case "CHAR":
            case "VARCHAR":
            case "NVARCHAR":
            case "LONGVARCHAR":
            case "LONGNVARCHAR":
            case "TEXT":
                result = value.trim();
                break;

            case "BIT":
            case "BOOLEAN":
                result = Boolean.parseBoolean(value.trim());
                break;

            case "BINARY":
            case "VARBINARY":
            case "LONGVARBINARY":
                result = value.trim().getBytes();
                break;

            case "DATE":
                try {
                    result = DateUtils.toDate(value.trim());
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new ServerException(e.getMessage());
                }
                break;
            case "DATETIME":
                try {
                    result = DateUtils.toDateTime(value.trim());
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new ServerException(e.getMessage());
                }
                break;
            case "TIMESTAMP":
                try {
                    result = DateUtils.toTimestamp(value.trim());
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new ServerException(e.getMessage());
                }
                break;

            case "BLOB":
                try {
                    result = new SerialBlob(value.trim().getBytes());
                } catch (SQLException e) {
                    e.printStackTrace();
                    throw new ServerException(e.getMessage());
                }
                break;
            case "CLOB":
                try {
                    result = new SerialClob(value.trim().toCharArray());
                } catch (SQLException e) {
                    e.printStackTrace();
                    throw new ServerException(e.getMessage());
                }
                break;
            default:
                result = value.trim();
        }
        return result;
    }
}
