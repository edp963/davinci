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

package edp.core.enums;

public enum TypeEnum {

    BIT(-7, "BIT"),

    TINYINT(-6, "TINYINT"),

    SMALLINT(5, "SMALLINT"),

    INTEGER(4, "INTEGER"),

    BIGINT(-5, "BIGINT"),

    FLOAT(6, "FLOAT"),

    REAL(7, "REAL"),

    DOUBLE(8, "DOUBLE"),

    NUMERIC(2, "NUMERIC"),

    DECIMAL(3, "DECIMAL"),

    CHAR(1, "CHAR"),

    VARCHAR(12, "VARCHAR"),

    LONGVARCHAR(-1, "LONGVARCHAR"),

    DATE(91, "DATE"),

    TIME(92, "TIME"),

    TIMESTAMP(93, "TIMESTAMP"),

    BINARY(-2, "BINARY"),

    VARBINARY(-3, "VARBINARY"),

    LONGVARBINARY(-4, "LONGVARBINARY"),

    NULL(0, "NULL"),

    OTHER(1111, "OTHER"),

    JAVA_OBJECT(2000, "JAVA_OBJECT"),

    DISTINCT(2001, "DISTINCT"),

    STRUCT(2002, "STRUCT"),

    ARRAY(2003, "ARRAY"),

    BLOB(2004, "BLOB"),

    CLOB(2005, "CLOB"),

    REF(2006, "REF"),

    DATALINK(70, "DATALINK"),

    BOOLEAN(16, "BOOLEAN"),

    ROWID(-8, "ROWID"),

    NCHAR(-15, "NCHAR"),

    NVARCHAR(-9, "NVARCHAR"),

    LONGNVARCHAR(-16, "LONGNVARCHAR"),

    NCLOB(2011, "NCLOB"),

    SQLXML(2009, "SQLXML"),

    REF_CURSOR(2012, "REF_CURSOR"),

    TIME_WITH_TIMEZONE(2013, "TIME_WITH_TIMEZONE"),

    TIMESTAMP_WITH_TIMEZONE(2014, "TIMESTAMP_WITH_TIMEZONE");

    private int value;
    private String typeName;

    TypeEnum(int value, String typeName) {
        this.value = value;
        this.typeName = typeName;
    }

    public static String getType(int value) {
        for (TypeEnum typeEnum : values()) {
            if (value == typeEnum.value) {
                return typeEnum.typeName;
            }
        }
        return null;
    }
}
