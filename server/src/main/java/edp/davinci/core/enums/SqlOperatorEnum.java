/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.core.enums;

public enum SqlOperatorEnum {
    IN("IN"),
    NoTIN("NOT IN"),
    EQUALSTO("="),
    BETWEEN("BETWEEN"),
    GREATERTHAN(">"),
    GREATERTHANEQUALS(">="),
    ISNULL("IS NULL"),
    LIKE("LIKE"),
    MINORTHAN("<"),
    MINORTHANEQUALS("<="),
    NOTEQUALSTO("!="),
    EXISTS("EXISTS");

    private String value;

    SqlOperatorEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SqlOperatorEnum getSqlOperator(String src) {
        for (SqlOperatorEnum operatorEnum : SqlOperatorEnum.values()) {
            if (src.toUpperCase().indexOf(operatorEnum.value) > -1) {
                return operatorEnum;
            }
        }
        return null;
    }
}
