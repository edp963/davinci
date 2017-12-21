



package com.github.tototoshi.csv;

import java.io.Closeable;
import java.io.IOException;

public interface LineReader extends Closeable {

    String readLineWithTerminator() throws IOException;
}

