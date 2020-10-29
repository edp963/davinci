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

package edp.core.consts;

import java.io.File;
import java.util.regex.Pattern;

public class Consts {

    /**
     * 特殊符号定义
     */
    public static final String COMMA = ",";

    public static final String SLASH = "/";

    public static final String BACK_SLASH = "\\";

    public static final String DOUBLE_SLASH = "//";

    public static final String SPACE = " ";

    public static final String EMPTY = "";

    public static final String SEMICOLON = ";";

    public static final String QUESTION_MARK = "?";

    public static final String SQL_URL_SEPARATOR = "&";

    public static final String AT_SYMBOL = "@";

    public static final String OCTOTHORPE = "#";

    public static final String PERCENT_SIGN = "%";

    public static final String NEW_LINE_CHAR = "\n";

    public static final String COLON = ":";

    public static final String MINUS = "-";

    public static final String UNDERLINE = "_";

    public static final String CSV_HEADER_SEPARATOR = ":";

    public static final String DELIMITER_START_CHAR = "<";

    public static final String DELIMITER_END_CHAR = ">";

    public static final String PARENTHESES_START = "(";

    public static final String PARENTHESES_END = ")";

    public static final String SQUARE_BRACKET_START = "[";

    public static final String SQUARE_BRACKET_END = "]";

    public static final String ASSIGNMENT_CHAR = "=";

    public static final String DOLLAR_DELIMITER = "$";

    public static final String MYSQL_KEY_DELIMITER = "`";

    public static final String APOSTROPHE = "'";

    public static final String DOUBLE_QUOTES = "\"";

    public static final String DOT = ".";


    /**
     * 当前用户
     */
    public static final String CURRENT_USER = "CURRENT_USER";


    /**
     * 当前平台
     */
    public static final String CURRENT_PLATFORM = "CURRENT_PLATFORM";


    /**
     * auth code key
     */
    public static final String AUTH_CODE = "authCode";


    /**
     * Token 前缀
     */
    public static final String TOKEN_PREFIX = "Bearer";

    /**
     * Token header名称
     */
    public static final String TOKEN_HEADER_STRING = "Authorization";

    /**
     * Token 用户名
     */
    public static final String TOKEN_USER_NAME = "token_user_name";

    /**
     * Token 密码
     */
    public static final String TOKEN_USER_PASSWORD = "token_user_password";

    /**
     * Token 创建时间
     */
    public static final String TOKEN_CREATE_TIME = "token_create_time";

    public static final String DEFAULT_COPY_SUFFIX = "_COPY";

    /**
     * 常用图片格式
     */
    public static final String REG_IMG_FORMAT = "^.+(.JPEG|.jpeg|.JPG|.jpg|.PNG|.png|.GIF|.gif)$";
    public static final Pattern PATTERN_IMG_FROMAT = Pattern.compile(REG_IMG_FORMAT);

    /**
     * 邮箱格式
     */
    public static final String REG_EMAIL_FORMAT = "^[a-z_0-9.-]{1,64}@([a-z0-9-]{1,200}.){1,5}[a-z]{1,6}$";
    public static final Pattern PATTERN_EMAIL_FORMAT = Pattern.compile(Consts.REG_EMAIL_FORMAT);


    /**
     * 敏感sql操作
     */
    public static final String REG_SENSITIVE_SQL = "drop\\s|alter\\s|grant\\s|insert\\s|replace\\s|delete\\s|truncate\\s|update\\s|remove\\s";
    public static final Pattern PATTERN_SENSITIVE_SQL = Pattern.compile(REG_SENSITIVE_SQL);

    private static final String REG_WITH_SQL_FRAGMENT = "((?i)WITH[\\s\\S]+(?i)AS?\\s*\\([\\s\\S]+\\))\\s*(?i)SELECT";
    public static final Pattern WITH_SQL_FRAGMENT = Pattern.compile(REG_WITH_SQL_FRAGMENT);

    /**
     * 匹配多行sql注解正则
     */
    public static final String REG_SQL_ANNOTATE = "(?ms)('(?:''|[^'])*')|--.*?$|/\\*[^+]*?\\*/";
    public static final Pattern PATTERN_SQL_ANNOTATE = Pattern.compile(REG_SQL_ANNOTATE);

    /**
     * sql 常见聚合函数
     */
    public static final Pattern PATTERN_DB_COLUMN_TYPE = Pattern.compile("^.*\\s*\\(.*\\)$");

    public static final Pattern PATTERN_JDBC_TYPE = Pattern.compile("jdbc:\\w+");

    public static final String DIR_DOWNLOAD = File.separator + "download" + File.separator;

    public static final String DIR_SHARE_DOWNLOAD = File.separator + "share" + File.separator + "download" + File.separator;

    public static final String DIR_EMAIL = File.separator + "email" + File.separator;

    public static final String DIR_TEMP = File.separator + "tempFiles" + File.separator;

    public static final String HTTP_PROTOCOL = "http";

    public static final String HTTPS_PROTOCOL = "https";

    public static final String PROTOCOL_SEPARATOR = "://";

    public static final String QUERY_COUNT_SQL = "SELECT COUNT(*) FROM (%s) CT";

    public static final String QUERY_META_SQL = "SELECT * FROM (%s) MT WHERE 1=0";

    public static final String JDBC_PREFIX_FORMATTER = "jdbc:%s:";

    public static final String ORACLE_JDBC_PREFIX = "jdbc:oracle:thin:";

    public static final String JDBC_DATASOURCE_DEFAULT_VERSION = "Default";

    public static final String PATH_EXT_FORMATTER = "lib" + File.separator + "ext" + File.separator + "%s" + File.separator + "%s" + File.separator;

    public static final int INVALID_SHEET_NAME_LENGTH = 28;
    private static final String REG_INVALID_SHEET_NAME = "[\\!\\\\\\/\\?\\*\\[\\]\\:]";
    public static final Pattern INVALID_SHEET_NAME = Pattern.compile(REG_INVALID_SHEET_NAME);
}
