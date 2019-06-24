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

package edp.davinci.dto.projectDto;

import com.alibaba.druid.util.StringUtils;
import edp.davinci.dto.userDto.UserBaseInfo;
import edp.davinci.model.User;
import lombok.Data;

@Data
public class RelProjectAdminDto {
    private Long id;

    private UserBaseInfo user;

    public RelProjectAdminDto(Long id, User user) {
        this.id = id;
        UserBaseInfo userBaseInfo = new UserBaseInfo();
        userBaseInfo.setId(user.getId());
        userBaseInfo.setAvatar(user.getAvatar());
        userBaseInfo.setUsername(StringUtils.isEmpty(user.getName()) ? user.getUsername() : user.getName());
        this.user = userBaseInfo;
    }


    public RelProjectAdminDto() {
    }
}
