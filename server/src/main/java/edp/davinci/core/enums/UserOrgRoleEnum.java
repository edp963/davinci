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

public enum UserOrgRoleEnum {

    MEMBER((short) 0, "member"),
    OWNER((short) 1, "owner");

    private short role;
    private String roleName;

    UserOrgRoleEnum(short role, String roleName) {
        this.role = role;
        this.roleName = roleName;
    }

    public static UserOrgRoleEnum roleOf(int role) {
        for (UserOrgRoleEnum userOrgRoleEnum : values()) {
            if ((int) userOrgRoleEnum.getRole() == role) {
                return userOrgRoleEnum;
            }
        }
        return null;
    }

    public short getRole() {
        return role;
    }
}
