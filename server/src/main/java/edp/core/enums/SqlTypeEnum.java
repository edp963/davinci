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

import edp.core.exception.ServerException;

public enum SqlTypeEnum {

    TINYINT("TINYINT", "TINYINT(2)"),
    SMALLINT("SMALLINT", "SMALLINT(3)"),
    INT("INT", "INT(12)"),
    INTEGER("INTEGER", "INTEGER(12)"),
    BIGINT("BIGINT", "BIGINT(20)"),
    DECIMAL("DECIMAL", "DECIMAL(17,6)"),
    NUMERIC("NUMERIC", "NUMERIC(17,6)"),
    REAL("REAL", "REAL"),
    FLOAT("FLOAT", "FLOAT"),
    DOUBLE("DOUBLE", "DOUBLE"),
    CHAR("CHAR", "CHAR(1)"),
    VARCHAR("VARCHAR", "VARCHAR(255)"),
    NVARCHAR("NVARCHAR", "NVARCHAR(1000)"),
    LONGVARCHAR("LONGVARCHAR", "LONGVARCHAR(2000)"),
    LONGNVARCHAR("LONGNVARCHAR", "LONGNVARCHAR(2000)"),
    TEXT("TEXT", "TEXT"),
    BOOLEAN("BOOLEAN", "BIT(1)"),
    BIT("BIT", "BIT(8)"),
    BINARY("BINARY", "BINARY(128)"),
    VARBINARY("VARBINARY", "VARBINARY(128)"),
    LONGVARBINARY("LONGVARBINARY", "LONGVARBINARY(128)"),
    DATE("DATE", "DATE"),
    DATETIME("DATETIME", "DATETIME"),
    TIMESTAMP("TIMESTAMP", "TIMESTAMP"),
    BLOB("BLOB", "BLOB"),
    CLOB("CLOB", "CLOB");

    private String name;
    private String type;

    SqlTypeEnum(String name, String type) {
        this.name = name;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public static String getType(String name) throws ServerException {
        name = name.toUpperCase();
        for (SqlTypeEnum sqlTypeEnum : values()) {
            if (sqlTypeEnum.name.equals(name)) {
                return sqlTypeEnum.type;
            }
        }
        throw new ServerException("Unknown Type: " + name);
    }
}
