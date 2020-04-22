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

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.alibaba.fastjson.serializer.ValueFilter;
import edp.core.utils.AESUtils;
import edp.core.utils.StringZipUtil;
import edp.davinci.core.enums.ShareDataPermission;
import edp.davinci.core.enums.ShareMode;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class ShareFactor {

    private static class ShareFactorSerializeFilter implements ValueFilter {
        @Override
        public Object process(Object object, String name, Object value) {
            if (value == null) {
                return null;
            }
            if (value instanceof String && ((String) value).trim().length() == 0) {
                return null;
            }
            if (value instanceof List && ((List) value).isEmpty()) {
                return null;
            }
            if (value instanceof ShareMode) {
                return ((ShareMode) value).getMode();
            }
            if (value instanceof ShareDataPermission) {
                return ((ShareDataPermission) value).getPermission();
            }
            return value;
        }
    }

    private static final SerializerFeature[] serializerFeatures = {
            SerializerFeature.QuoteFieldNames,
            SerializerFeature.DisableCircularReferenceDetect,
    };

    private static final ShareFactorSerializeFilter serializeFilter = new ShareFactorSerializeFilter();

    /**
     * share mode
     * <p>
     * <code>{@link ShareMode}</code>
     * 0: compatible
     * 1: normal
     * 2: password
     * 3: auth (user)
     * 4: auth (role)
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


    private Long expire = null;


    public static ShareFactor parseShareFactor(String token, String slat) throws IllegalArgumentException {
        ShareFactor factor = null;
        try {
            String uncompress = StringZipUtil.uncompress(token);
            String decrypt = AESUtils.decrypt(uncompress, slat);
            factor = JSONObject.parseObject(decrypt, ShareFactor.class);
            factor.format();
        } catch (Exception e) {
            factor = new ShareFactor();
            factor.setMode(ShareMode.COMPATIBLE);
        }
        if (factor.getMode() != ShareMode.COMPATIBLE && factor.getExpire() != null && factor.getExpire() > 0L) {
            long now = System.currentTimeMillis();
            if (now > factor.getExpire()) {
                throw new IllegalArgumentException("invalid token: expired!");
            }
        }
        return factor;
    }

    public String toShareToken(String slat) {
        format();
        String jsonString = JSONObject.toJSONString(this, serializeFilter, serializerFeatures);
        return StringZipUtil.compress(AESUtils.encrypt(jsonString, slat));
    }

    public void format() {
        switch (this.getMode()) {
            case COMPATIBLE:
                this.setPermission(null);
                this.setRoles(null);
                this.setEntityId(null);
                this.setSharerId(null);
                this.setPassword(null);
                this.setViewers(null);
                this.setRoles(null);
                this.setExpire(null);
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
            case AUTH:
                this.setPassword(null);
                break;
        }
    }
}
