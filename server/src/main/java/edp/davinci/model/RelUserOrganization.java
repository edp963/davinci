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

package edp.davinci.model;

import edp.core.model.RecordInfo;
import lombok.Data;

@Data
public class RelUserOrganization extends RecordInfo<RelUserOrganization> {
    private Long id;

    private Long orgId;

    private Long userId;

    private Short role = 0;

    public RelUserOrganization() {
    }

    public RelUserOrganization(Long orgId, Long userId, Short role) {
        this.orgId = orgId;
        this.userId = userId;
        this.role = role;
    }
}