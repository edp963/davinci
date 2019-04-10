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
    public static final String conditionSeparator = ",";

    public static final String space = " ";

    public static final String sqlSeparator = ";";

    public static final String sqlUrlSeparator = "&";

    public static final String octothorpe = "#";

    public static final String percentSign = "%";

    public static final String newLineChar = "\n";

    public static final String colon = ":";

    public static final String minus = "-";

    public static final String underline = "_";

    public static final char CSVHeaderSeparator = ':';

    public static final char delimiterStartChar = '<';

    public static final char delimiterEndChar = '>';

    public static final String parenthesesStart = "(";

    public static final String parenthesesEnd = ")";

    public static final String squareBracketStart = "[";

    public static final String squareBracketEnd = "]";


    public static final char assignmentChar = '=';

    public static final char dollarDelimiter = '$';

    public static final String mysqlKeyDelimiter = "`";

    public static final String apostrophe = "\'";

    public static final String doubleQuotes = "\"";


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
    public static final String REG_SENSITIVE_SQL = "drop\\s|alert\\s|grant\\s|delete\\s|truncate\\s|update\\s|remove\\s";


    /**
     * 匹配多行sql注解正则
     */
    public static final String REG_SQL_ANNOTATE = "(?ms)('(?:''|[^'])*')|--.*?$|/\\*[^+]*?\\*/";


    public static final String DIR_DOWNLOAD = File.separator + "download" + File.separator;

    public static final String DIR_EMAIL = File.separator + "email" + File.separator;

    public static final String DIR_TEMPL = File.separator + "tempFiles" + File.separator;

}
