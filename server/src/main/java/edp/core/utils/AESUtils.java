package edp.core.utils;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class AESUtils {

    private static final String KEY_AES = "AES";

    /**
     * AES加密默认盐值
     */
    public static final String AES_KEY = "s˚∆ƒ˚∂√";

    public static String encrypt(String src, String key) {
        if (null == key || key.getBytes().length != 16) {
            key = AES_KEY;
        }
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
        if (null == key || key.length() != 16) {
            key = AES_KEY;
        }
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
            e.printStackTrace();
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
