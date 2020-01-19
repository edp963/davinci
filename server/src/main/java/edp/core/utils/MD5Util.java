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

import sun.misc.BASE64Encoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class MD5Util {

    /**
     * MD5加密
     *
     * @param src     需要加密的字符串
     * @param isUpper 大小写
     * @param bit     加密长度（16,32,64）
     * @return
     */
    public static String getMD5(String src, boolean isUpper, Integer bit) {
        String md5 = "";
        try {
            // 创建加密对象
            MessageDigest md = MessageDigest.getInstance("md5");
            if (bit == 64) {
                BASE64Encoder bw = new BASE64Encoder();
                String bsB64 = bw.encode(md.digest(src.getBytes(StandardCharsets.UTF_8)));
                md5 = bsB64;
            } else {
                // 计算MD5函数
                md.update(src.getBytes(StandardCharsets.UTF_8));
                byte b[] = md.digest();
                int i;
                StringBuffer sb = new StringBuffer("");
                for (int offset = 0; offset < b.length; offset++) {
                    i = b[offset];
                    if (i < 0)
                        i += 256;
                    if (i < 16)
                        sb.append("0");
                    sb.append(Integer.toHexString(i));
                }
                md5 = sb.toString();
                if (bit == 16) {
                    //截取32位md5为16位
                    String md16 = md5.substring(8, 24);
                    md5 = md16;
                    if (isUpper) {
                        md5 = md5.toUpperCase();
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (isUpper) {
            md5 = md5.toUpperCase();
        }
        return md5;
    }
}
