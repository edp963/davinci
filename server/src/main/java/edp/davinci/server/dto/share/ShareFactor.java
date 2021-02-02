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

package edp.davinci.server.dto.share;

import edp.davinci.commons.util.AESUtils;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.User;
import edp.davinci.server.dto.project.ProjectDetail;
import edp.davinci.server.enums.ShareDataPermission;
import edp.davinci.server.enums.ShareMode;
import edp.davinci.server.enums.ShareType;
import lombok.Data;
import org.springframework.beans.BeanUtils;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Data
public class ShareFactor {

    private static final char[] PASSWORD_SEEDS = {
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N',
            'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    };

    private static final int PASSWORD_LEN = 8;

    private static final int DEFAULT_TOKEN_EXPIRE_DAYS = 7;

    /**
     * share mode
     * <p>
     * <code>{@link ShareMode}</code>
     * 0: compatible
     * 1: normal
     * 2: password
     * 3: auth
     */
    private ShareMode mode = ShareMode.COMPATIBLE;

    /**
     * data permission
     * <p>
     * <code>{@link ShareDataPermission}</code>
     * 0: sharer
     * 1: viewer
     */
    private ShareDataPermission permission = ShareDataPermission.SHARER;

    /**
     * share type
     * <p>
     * <code>{@link ShareType}</code>
     * 0: sharer
     * 1: viewer
     */
    private ShareType type;

    /**
     * share entity id
     */
    private Long entityId;

    /**
     * sharer id
     */
    private Long sharerId;

    /**
     * password
     * <p>
     * only for mode == 2
     */
    private String password;


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

    private Date expired = null;

    /**
     * permission == ShareDataPermission.SHARER ? sharer : viewer
     */
    private User user;
    private Object shareEntity;
    private ProjectDetail projectDetail;

    public static ShareFactor parseShareFactor(String token, String secret) throws IllegalArgumentException {
        ShareFactor factor;
        try {
            String decompress = StringUtils.decompress(token);
            String decrypt = AESUtils.decrypt(decompress, secret);
            factor = JSONUtils.toObject(decrypt, ShareFactor.class);
            factor.format();
        } catch (Exception e) {
            factor = new ShareFactor();
            factor.setMode(ShareMode.COMPATIBLE);
        }
        return factor;
    }

    public ShareResult toShareResult(String secret) {
        if (this.mode == ShareMode.PASSWORD) {
            this.password = randomPassword();
        }
        format();
        String jsonString = JSONUtils.toString(this);
        return new ShareResult(StringUtils.compress(AESUtils.encrypt(jsonString, secret)), this.password);
    }

    public void freshWidgetDataToken(SimpleShareWidget simpleShareWidget, String secret) {
        this.setEntityId(simpleShareWidget.getId());
        this.setType(ShareType.WIDGET);
        if (ShareMode.PASSWORD == this.mode) {
            this.setMode(ShareMode.NORMAL);
            this.setPassword(null);
        }
        ShareResult shareResult = this.toShareResult(secret);
        simpleShareWidget.setDataToken(shareResult.getToken());
    }

    public void freshViewDataToken(ShareView shareView, String secret) {
        this.setEntityId(shareView.getId());
        this.setType(ShareType.VIEW);
        if (ShareMode.PASSWORD == this.mode) {
            this.setMode(ShareMode.NORMAL);
            this.setPassword(null);
        }
        ShareResult shareResult = this.toShareResult(secret);
        shareView.setDataToken(shareResult.getToken());
    }

    private void format() {
        switch (this.getMode()) {
            case COMPATIBLE:
                this.setPermission(null);
                this.setRoles(null);
                this.setEntityId(null);
                this.setSharerId(null);
                this.setPassword(null);
                this.setViewers(null);
                this.setRoles(null);
                this.setExpired(null);
                break;
            case NORMAL:
                this.setPermission(ShareDataPermission.SHARER);
                this.setPassword(null);
                this.setViewers(null);
                this.setRoles(null);
                break;
            case PASSWORD:
                this.setPermission(ShareDataPermission.SHARER);
                this.setViewers(null);
                this.setRoles(null);
                break;
            default:
                break;
        }
    }


    private static String randomPassword() {
        IntStream intStream = new Random().ints(0, PASSWORD_SEEDS.length);
        return intStream.limit(PASSWORD_LEN).mapToObj(i -> PASSWORD_SEEDS[i]).map(String::valueOf).collect(Collectors.joining());
    }

    public static class Builder {
        private ShareFactor shareFactor;

        private Builder() {
            shareFactor = new ShareFactor();
        }

        public Builder withShareEntity(ShareEntity shareEntity) {
            BeanUtils.copyProperties(shareEntity, shareFactor);
            return this;
        }

        public Builder withMode(ShareMode mode) {
            shareFactor.mode = mode;
            return this;
        }

        public Builder withPermission(ShareDataPermission permission) {
            shareFactor.permission = permission;
            return this;
        }

        public Builder withType(ShareType type) {
            shareFactor.type = type;
            return this;
        }

        public Builder withEntityId(Long entityId) {
            shareFactor.entityId = entityId;
            return this;
        }

        public Builder withSharerId(Long sharerId) {
            shareFactor.sharerId = sharerId;
            return this;
        }

        public Builder withPassword(String password) {
            shareFactor.password = password;
            return this;
        }

        public Builder withViewers(Set<Long> viewers) {
            shareFactor.viewers = viewers;
            return this;
        }

        public Builder withRoles(Set<Long> roles) {
            shareFactor.roles = roles;
            return this;
        }

        public Builder withExpired(Date expired) {
            shareFactor.expired = expired;
            return this;
        }

        public static Builder shareFactor() {
            return new Builder();
        }

        public ShareFactor build() {
            assert shareFactor.entityId > 0L;
            assert shareFactor.sharerId > 0L;
            assert shareFactor.type != null;

            shareFactor.format();
            return shareFactor;
        }
    }
}
