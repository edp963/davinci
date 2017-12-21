



package com.github.tototoshi.csv;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;

public class ReaderLineReader implements LineReader {

    private BufferedReader bufferedReader;
    private Reader baseReader;

    public ReaderLineReader(Reader reader) {
        this.baseReader = reader;
        this.bufferedReader = new BufferedReader(reader);
    }

    public String readLineWithTerminator() throws IOException {
        StringBuilder sb = new StringBuilder();
        do {

            int c = bufferedReader.read();

            if (c == -1) {
                if (sb.length() == 0) {
                    return null;
                } else {
                    break;
                }
            }

            sb.append((char) c);

            if (c == '\n'
                    || c == '\u2028'
                    || c == '\u2029'
                    || c == '\u0085') {
                break;
            }

            if (c == '\r') {

                bufferedReader.mark(1);

                c = bufferedReader.read();

                if (c == -1) {
                    break;
                } else if (c == '\n') {
                    sb.append('\n');
                } else {
                    bufferedReader.reset();
                }

                break;
            }

        } while (true);

        return sb.toString();
    }

    public void close() throws IOException {
        bufferedReader.close();
        baseReader.close();
    }
}
