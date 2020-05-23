/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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
 */

package edp.davinci.core.enums;

import lombok.Getter;

public enum SystemVariableEnum {

    USER_ID("$DAVINCI.USER.ID$", "\\$DAVINCI.USER.ID\\$"),
    USER_NAME("$DAVINCI.USER.NAME$", "\\$DAVINCI.USER.NAME\\$"),
    USER_USERNAME("$DAVINCI.USER.USERNAME$", "\\$DAVINCI.USER.USERNAME\\$"),
    USER_EMAIL("$DAVINCI.USER.EMAIL$", "\\$DAVINCI.USER.EMAIL\\$"),
    USER_DEPARTMENT("$DAVINCI.USER.DEPARTMENT$", "\\$DAVINCI.USER.DEPARTMENT\\$");

    @Getter
    private String key;

    @Getter
    private String regex;

    SystemVariableEnum(String variable, String regex) {
        this.key = variable;
        this.regex = regex;
    }

    public static boolean isContains(String str) {
        str = str.toUpperCase();
        return str.contains(USER_ID.key) ||
                str.contains(USER_NAME.key) ||
                str.contains(USER_USERNAME.key) ||
                str.contains(USER_EMAIL.key) ||
                str.contains(USER_DEPARTMENT.key);
    }
}
