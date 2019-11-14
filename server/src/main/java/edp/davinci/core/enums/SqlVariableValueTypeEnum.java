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

import edp.core.utils.SqlUtils;
import edp.davinci.core.common.Constants;
import org.apache.commons.lang.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.APOSTROPHE;
import static edp.core.consts.Consts.EMPTY;

public enum SqlVariableValueTypeEnum {
    STRING("string"),
    NUMBER("number"),
    BOOLEAN("boolean"),
    DATE("date"),
    SQL("sql");

    private String valueType;

    SqlVariableValueTypeEnum(String valueType) {
        this.valueType = valueType;
    }

    public static List<String> getValues(String valueType, List<Object> values, boolean udf) {
        if (null == values) {
            return null;
        }

        if (values.isEmpty()) {
            return new ArrayList<>();
        }

        SqlVariableValueTypeEnum valueTypeEnum = SqlVariableValueTypeEnum.valueTypeOf(valueType.toLowerCase());

        if (udf && valueTypeEnum != SQL) {
            return values.stream().map(String::valueOf).collect(Collectors.toList());
        }

        if (null != valueTypeEnum) {
            switch (valueTypeEnum) {
                case STRING:
                case DATE:
                    return values.stream().map(String::valueOf)
                            .map(s -> s.equals(Constants.NO_AUTH_PERMISSION) || (s.startsWith(APOSTROPHE) && s.endsWith(APOSTROPHE)) ?
                                    s :
                                    String.join(EMPTY, APOSTROPHE, s, APOSTROPHE))
                            .collect(Collectors.toList());
                case SQL:
                    values.stream().map(String::valueOf).forEach(SqlUtils::checkSensitiveSql);
                    return values.stream().map(String::valueOf).collect(Collectors.toList());
                case NUMBER:
                    return values.stream().map(String::valueOf).collect(Collectors.toList());
                case BOOLEAN:
                    return Arrays.asList(String.valueOf(values.get(values.size() - 1)));
            }
        }
        return values.stream().map(String::valueOf).collect(Collectors.toList());
    }


    public static Object getValue(String valueType, String value, boolean udf) {
        if (!StringUtils.isEmpty(value)) {
            SqlVariableValueTypeEnum valueTypeEnum = SqlVariableValueTypeEnum.valueTypeOf(valueType.toLowerCase());


            if (udf && valueTypeEnum != SQL) {
                return value;
            }

            if (null != valueTypeEnum) {
                switch (valueTypeEnum) {
                    case STRING:
                    case DATE:
                        return String.join(EMPTY, value.startsWith(APOSTROPHE) ? EMPTY : APOSTROPHE, value, value.endsWith(APOSTROPHE) ? EMPTY : APOSTROPHE);
                    case NUMBER:
                    case SQL:
                        return value;
                    case BOOLEAN:
                        return Boolean.parseBoolean(value);
                }
            }
        }
        return value;
    }

    public static SqlVariableValueTypeEnum valueTypeOf(String valueType) {
        for (SqlVariableValueTypeEnum valueTypeEnum : values()) {
            if (valueTypeEnum.valueType.equals(valueType)) {
                return valueTypeEnum;
            }
        }
        return null;
    }

}
