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

package edp.davinci.dto.shareDto;

import edp.core.utils.CollectionUtils;
import edp.davinci.service.share.ShareDataPermission;
import edp.davinci.service.share.ShareMode;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.Set;

@Data
public class ShareEntity {

    /**
     * share mode
     * <p>
     * <code>{@link ShareMode}</code>
     * 0: compatible
     * 1: normal
     * 2: password
     * 3: auth
     */
    private ShareMode mode = ShareMode.NORMAL;

    /**
     * data permission
     * <p>
     * <code>{@link ShareDataPermission}</code>
     * 0: sharer
     * 1: viewer
     */
    private ShareDataPermission permission = ShareDataPermission.SHARER;

    /**
     * viewer id
     * <p>
     * for mode == 3
     */
    private Set<Long> viewers;

    /**
     * role id
     * <p>
     * for mode == 3
     */
    private Set<Long> roles;

    @NotNull(message = "Expired cannot be empty")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date expired;

    public void valid() throws IllegalArgumentException {
        switch (this.getMode()) {
            case NORMAL:
                if (this.permission != ShareDataPermission.SHARER) {
                    throw new IllegalArgumentException("Invalid data permission in NORMAL share mode");
                }
                break;
            case PASSWORD:
                if (this.permission != ShareDataPermission.SHARER) {
                    throw new IllegalArgumentException("Invalid data permission in PASSWORD share mode");
                }
                break;
            case AUTH:
                if (CollectionUtils.isEmpty(this.viewers) && CollectionUtils.isEmpty(this.roles)) {
                    throw new IllegalArgumentException("Invalid shared user in AUTH share mode");
                }
                if (!CollectionUtils.isEmpty(viewers)) {
                    viewers.forEach(id -> {
                        if (id < 1L) {
                            throw new IllegalArgumentException("Invalid viewer:" + id);
                        }
                    });
                }
                if (!CollectionUtils.isEmpty(roles)) {
                    roles.forEach(id -> {
                        if (id < 1L) {
                            throw new IllegalArgumentException("Invalid role:" + id);
                        }
                    });
                }
                break;
            default:
                break;
        }
    }
}
