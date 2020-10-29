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

package edp.core.utils;


import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

@Slf4j
public class StringZipUtil {

    private static final int BYTES_LENGTH = 256;

    /**
     * string compress
     *
     * @param source
     * @return
     */
    public static String compress(String source) {
        Deflater deflater = new Deflater(Deflater.BEST_COMPRESSION);
        deflater.setInput(source.getBytes());
        deflater.finish();

        final byte[] bytes = new byte[BYTES_LENGTH];
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(BYTES_LENGTH);

        while (!deflater.finished()) {
            int length = deflater.deflate(bytes);
            outputStream.write(bytes, 0, length);
        }
        deflater.end();
        return Base64.getUrlEncoder().withoutPadding().encodeToString(outputStream.toByteArray());
    }

    /**
     * string decompress
     *
     * @param source
     * @return
     */
    public static String decompress(String source) {
        byte[] decode = Base64.getUrlDecoder().decode(source);
        Inflater inflater = new Inflater();
        inflater.setInput(decode);
        final byte[] bytes = new byte[BYTES_LENGTH];
        try(ByteArrayOutputStream outputStream = new ByteArrayOutputStream(BYTES_LENGTH);) {
            while (!inflater.finished()) {
                int length = inflater.inflate(bytes);
                outputStream.write(bytes, 0, length);
            }
            source = outputStream.toString();
            return source;
        } catch (Exception e) {// compatible with older versions
            return source;
        } finally {
            inflater.end();
        }
    }
}
