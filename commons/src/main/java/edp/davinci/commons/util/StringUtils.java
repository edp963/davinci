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
 *
 */

package edp.davinci.commons.util;

import static edp.davinci.commons.Constants.EMPTY;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Collection;
import java.util.Iterator;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.text.StrBuilder;

public class StringUtils {

    private static final int BYTES_LENGTH = 256;
	
	private StringUtils() {

    }
    
    public static String compress(String src) {

        String res = null;

        Deflater deflater = new Deflater(Deflater.BEST_COMPRESSION);
        deflater.setInput(src.getBytes());
        deflater.finish();

        final byte[] bytes = new byte[BYTES_LENGTH];
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream(BYTES_LENGTH);) {
            
            while (!deflater.finished()) {
                int length = deflater.deflate(bytes);
                outputStream.write(bytes, 0, length);
            }
            
            res = Base64.getUrlEncoder().withoutPadding().encodeToString(outputStream.toByteArray());
        
        } catch (Exception e) {
            e.printStackTrace();
            return src;
        } finally {
            deflater.end();
        }

        return res;
    }

    public static String uncompress(String src) {
        
        String res = null;
        
        byte[] decode = Base64.getUrlDecoder().decode(src);
        Inflater inflater = new Inflater();
        inflater.setInput(decode);
        
        final byte[] bytes = new byte[BYTES_LENGTH];
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream(BYTES_LENGTH);) {
            
            while (!inflater.finished()) {
                int length = inflater.inflate(bytes);
                outputStream.write(bytes, 0, length);
            }
            
            res = outputStream.toString();
        
        } catch (Exception e) {
            e.printStackTrace();
            return res;
        } finally {
            inflater.end();
        }

        return res;
    }
	
    public static boolean isNotBlank(String str) {
    	return !isBlank(str);
    }
	
    public static boolean isBlank(String str) {
        int strLen;
        if (str == null || (strLen = str.length()) == 0) {
            return true;
        }
        for (int i = 0; i < strLen; i++) {
            if ((Character.isWhitespace(str.charAt(i)) == false)) {
                return false;
            }
        }
        return true;
    }
    
    public static boolean isNotEmpty(CharSequence value) {
    	return !isEmpty(value);
    }
	
	public static boolean isEmpty(CharSequence value) {
		return value == null || value.length() == 0;
	}
	
	public static boolean isNull(CharSequence value) {
		if (isEmpty(value) || "null".equals(value.toString().trim().toLowerCase())) {
			return true;
		}
		return false;
	}
	
	public static boolean isNumber(String str) {
        if (str.length() == 0) {
            return false;
        }
        int sz = str.length();
        boolean hasExp = false;
        boolean hasDecPoint = false;
        boolean allowSigns = false;
        boolean foundDigit = false;
        // deal with any possible sign up front
        int start = (str.charAt(0) == '-') ? 1 : 0;
        if (sz > start + 1) {
            if (str.charAt(start) == '0' && str.charAt(start + 1) == 'x') {
                int i = start + 2;
                if (i == sz) {
                    return false; // str == "0x"
                }
                // checking hex (it can't be anything else)
                for (; i < str.length(); i++) {
                    char ch = str.charAt(i);
                    if ((ch < '0' || ch > '9')
                            && (ch < 'a' || ch > 'f')
                            && (ch < 'A' || ch > 'F')) {
                        return false;
                    }
                }
                return true;
            }
        }
        sz--; // don't want to loop to the last char, check it afterwords
        // for type qualifiers
        int i = start;
        // loop to the next to last char or to the last char if we need another digit to
        // make a valid number (e.g. chars[0..5] = "1234E")
        while (i < sz || (i < sz + 1 && allowSigns && !foundDigit)) {
            char ch = str.charAt(i);
            if (ch >= '0' && ch <= '9') {
                foundDigit = true;
                allowSigns = false;

            } else if (ch == '.') {
                if (hasDecPoint || hasExp) {
                    // two decimal points or dec in exponent
                    return false;
                }
                hasDecPoint = true;
            } else if (ch == 'e' || ch == 'E') {
                // we've already taken care of hex.
                if (hasExp) {
                    // two E's
                    return false;
                }
                if (!foundDigit) {
                    return false;
                }
                hasExp = true;
                allowSigns = true;
            } else if (ch == '+' || ch == '-') {
                if (!allowSigns) {
                    return false;
                }
                allowSigns = false;
                foundDigit = false; // we need a digit after the E
            } else {
                return false;
            }
            i++;
        }
        if (i < str.length()) {
            char ch = str.charAt(i);

            if (ch >= '0' && ch <= '9') {
                // no type qualifier, OK
                return true;
            }
            if (ch == 'e' || ch == 'E') {
                // can't have an E at the last byte
                return false;
            }
            if (!allowSigns
                    && (ch == 'd'
                    || ch == 'D'
                    || ch == 'f'
                    || ch == 'F')) {
                return foundDigit;
            }
            if (ch == 'l'
                    || ch == 'L') {
                // not allowing L with an exponent
                return foundDigit && !hasExp;
            }
            // last character is illegal
            return false;
        }
        // allowSigns is true iff the val ends in 'E'
        // found digit it to make sure weird stuff like '.' and '1E-' doesn't pass
        return !allowSigns && foundDigit;
    }

    public static String join(Collection collection, String separator) {
        if (collection == null) {
            return null;
        }
        return join(collection.iterator(), separator);
    }

    public static String join(Iterator iterator, String separator) {

        // handle null, zero and one elements before building a buffer
        if (iterator == null) {
            return null;
        }
        if (!iterator.hasNext()) {
            return EMPTY;
        }
        Object first = iterator.next();
        if (!iterator.hasNext()) {
            return ObjectUtils.toString(first);
        }

        // two or more elements
        StrBuilder buf = new StrBuilder(256); // Java default is 16, probably too small
        if (first != null) {
            buf.append(first);
        }

        while (iterator.hasNext()) {
            if (separator != null) {
                buf.append(separator);
            }
            Object obj = iterator.next();
            if (obj != null) {
                buf.append(obj);
            }
        }
        return buf.toString();
    }

}
