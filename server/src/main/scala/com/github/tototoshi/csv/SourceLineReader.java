



package com.github.tototoshi.csv;

import scala.io.Source;

import java.io.IOException;

public class SourceLineReader implements LineReader {

    private Source source;

    public SourceLineReader(Source source) {
        this.source = source;
    }

    @Override
    public String readLineWithTerminator() throws IOException {
        StringBuilder sb = new StringBuilder();
        while(true) {
            if (!source.hasNext()) {
                if (sb.length() == 0) {
                    return null;
                } else {
                    break;
                }
            }
            int c = source.next();

            sb.append((char) c);

            if (c == '\n'
                    || c == '\u2028'
                    || c == '\u2029'
                    || c == '\u0085') {
                break;
            }

            if (c == '\r') {
                if (!source.hasNext()) {
                    break;
                }
                c = source.next();
                sb.append(c);
                if (c == '\n') {
                    break;
                }
            }
        }
        return sb.toString();
    }

    @Override
    public void close() throws IOException {
        source.close();
    }
}
