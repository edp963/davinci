/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.core.consts;

import java.io.File;

public class Consts {

    /**
     * 特殊符号定义
     */
    public static final String COMMA = ",";

    public static final String SLASH = "/";

    public static final String SPACE = " ";

    public static final String EMPTY = "";

    public static final String SEMICOLON = ";";

    public static final String QUESTION_MARK = "?";

    public static final String SQL_URL_SEPARATOR = "&";

    public static final String OCTOTHORPE = "#";

    public static final String PERCENT_SIGN = "%";

    public static final String NEW_LINE_CHAR = "\n";

    public static final String COLON = ":";

    public static final String MINUS = "-";

    public static final String UNDERLINE = "_";

    public static final char CSV_HEADER_SEPARATOR = ':';

    public static final char DELIMITER_START_CHAR = '<';

    public static final char DELIMITER_END_CHAR = '>';

    public static final String PARENTHESES_START = "(";

    public static final String PARENTHESES_END = ")";

    public static final String SQUARE_BRACKET_START = "[";

    public static final String SQUARE_BRACKET_END = "]";


    public static final char ASSIGNMENT_CHAR = '=';

    public static final char DOLLAR_DELIMITER = '$';

    public static final String MYSQL_KEY_DELIMITER = "`";

    public static final String APOSTROPHE = "'";

    public static final String DOUBLE_QUOTES = "\"";


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


    public static final String SCHEDULE_JOB_DATA_KEY = "scheduleJobs";

    /**
     * 常用图片格式
     */
    public static final String REG_IMG_FORMAT = "^.+(.JPEG|.jpeg|.JPG|.jpg|.PNG|.png|.GIF|.gif)$";

    /**
     * 邮箱格式
     */
    public static final String REG_EMAIL_FORMAT = "^[a-z_0-9.-]{1,64}@([a-z0-9-]{1,200}.){1,5}[a-z]{1,6}$";

    /**
     * 敏感sql操作
     */
    public static final String REG_SENSITIVE_SQL = "drop\\s|alter\\s|grant\\s|insert\\s|replace\\s|delete\\s|truncate\\s|update\\s|remove\\s";


    /**
     * 匹配多行sql注解正则
     */
    public static final String REG_SQL_ANNOTATE = "(?ms)('(?:''|[^'])*')|--.*?$|/\\*[^+]*?\\*/";


    public static final String DIR_DOWNLOAD = File.separator + "download" + File.separator;

    public static final String DIR_EMAIL = File.separator + "email" + File.separator;

    public static final String DIR_TEMPL = File.separator + "tempFiles" + File.separator;

    public static final String HTTP_PROTOCOL = "http";

    public static final String HTTPS_PROTOCOL = "https";

    public static final String PROTOCOL_SEPARATOR = "://";


    public static final String QUERY_COUNT_SQL = "SELECT COUNT(*) FROM (%s) CT";
}
