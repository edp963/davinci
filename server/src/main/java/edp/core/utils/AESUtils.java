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

package edp.core.utils;

import com.alibaba.druid.util.StringUtils;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class AESUtils {

    private static final String KEY_AES = "AES";

    /**
     * AES加密默认盐值
     */
    public static final String AES_KEY = "sM7!tsv?5ygRo;h.";


    private static String garbleSalt(String src) {
        if (StringUtils.isEmpty(src)) {
            return AES_KEY;
        } else {
            src += AES_KEY;
            return src.substring(0, 16);
        }
    }

    public static String encrypt(String src, String key) {
        key = garbleSalt(key);
        try {
            byte[] raw = key.getBytes();
            SecretKeySpec skeySpec = new SecretKeySpec(raw, KEY_AES);
            Cipher cipher = Cipher.getInstance(KEY_AES);
            cipher.init(Cipher.ENCRYPT_MODE, skeySpec);
            byte[] encrypted = cipher.doFinal(src.getBytes());
            return byte2hex(encrypted);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return src;
    }

    public static String decrypt(String src, String key) {
        key = garbleSalt(key);
        try {
            byte[] raw = key.getBytes();
            SecretKeySpec skeySpec = new SecretKeySpec(raw, KEY_AES);
            Cipher cipher = Cipher.getInstance(KEY_AES);
            cipher.init(Cipher.DECRYPT_MODE, skeySpec);
            byte[] encrypted1 = hex2byte(src);
            byte[] original = cipher.doFinal(encrypted1);
            String originalString = new String(original);
            return originalString;
        } catch (Exception e) {
            //ignore
        }
        return src;
    }

    public static byte[] hex2byte(String strhex) {
        if (null == strhex) {
            return null;
        }
        int l = strhex.length();
        if (l % 2 == 1) {
            return null;
        }
        byte[] b = new byte[l / 2];
        for (int i = 0; i != l / 2; i++) {
            b[i] = (byte) Integer.parseInt(strhex.substring(i * 2, i * 2 + 2),
                    16);
        }
        return b;
    }

    public static String byte2hex(byte[] b) {
        String hs = "";
        String stmp = "";
        for (int n = 0; n < b.length; n++) {
            stmp = (java.lang.Integer.toHexString(b[n] & 0XFF));
            if (stmp.length() == 1) {
                hs = hs + "0" + stmp;
            } else {
                hs = hs + stmp;
            }
        }
        return hs.toUpperCase();
    }

}
