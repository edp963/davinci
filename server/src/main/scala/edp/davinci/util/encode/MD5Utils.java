/*-
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */





package edp.davinci.util.encode;

import java.security.MessageDigest;

public class MD5Utils {
    public static String getMD5(String str) throws Exception{
        try {
            MessageDigest instance = MessageDigest.getInstance("MD5");
            byte[] digest = instance.digest(str.getBytes());

            StringBuffer sb = new StringBuffer();
            for (byte b : digest) {
                int i = b & 0xff;
                String hexString = Integer.toHexString(i);
                // System.out.println(hexString);

                if (hexString.length() < 2) {
                    hexString = "0" + hexString;
                }

                sb.append(hexString);
            }

            return sb.toString();

        } catch (Exception e) {
            throw e;
        }
    }
}
