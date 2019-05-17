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

package edp.davinci.core.enums;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.apostrophe;

public enum SqlVariableValueTypeEnum {
    STRING("string"),
    NUMBER("number"),
    BOOLEAN("boolean"),
    DATE("date");

    private String valueType;

    SqlVariableValueTypeEnum(String valueType) {
        this.valueType = valueType;
    }

    public static List<String> getValue(String valueType, List<Object> values) {
        if (null == values || values.size() == 0) {
            return new ArrayList<>();
        }

        switch (SqlVariableValueTypeEnum.valueOf(valueType.toUpperCase())) {
            case STRING:
            case DATE:
                return values.stream().map(String::valueOf).map(s -> String.join("", apostrophe, s, apostrophe)).collect(Collectors.toList());
            case NUMBER:
                return values.stream().map(String::valueOf).collect(Collectors.toList());
            case BOOLEAN:
                return Arrays.asList(String.valueOf(values.get(values.size() - 1)));
        }
        return values.stream().map(String::valueOf).map(s -> String.join("", apostrophe, s, apostrophe)).collect(Collectors.toList());
    }

}
