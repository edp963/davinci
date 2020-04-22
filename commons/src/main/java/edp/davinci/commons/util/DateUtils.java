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

package edp.davinci.commons.util;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.joda.time.DateTime;

public class DateUtils {
	
    public static final String DATE_BASE_REGEX = "\\d{4}-\\d{1,2}-\\d{1,2}";
    public static final String SEPARATOR_REGEX = "(T?|\\s*)";

    public static final String DATE_REGEX = "^\\s*" + DATE_BASE_REGEX + "\\s*$";
    public static final String DATE_H_REGEX = "^\\s*" + DATE_BASE_REGEX + SEPARATOR_REGEX + "\\d\\d\\s*$";
    public static final String DATE_HM_REGEX = "^\\s*" + DATE_BASE_REGEX + SEPARATOR_REGEX + "\\d{1,2}:\\dd{1,2}\\s*$";
    public static final String DATE_HMS_REGEX = "^\\s*" + DATE_BASE_REGEX + SEPARATOR_REGEX + "\\d{1,2}:\\d{1,2}:\\d{1,2}\\s*$";
    public static final String DATE_HMS_M_REGEX = "^\\s*" + DATE_BASE_REGEX + SEPARATOR_REGEX + "\\d{1,2}:\\d{1,2}:\\d{1,2}\\.\\d{1,3}\\s*$";

    private enum DATE_FORMAT_ENUM {

        DATE(Pattern.compile(DATE_REGEX), "yyyy-M-d"),
        DATE_H(Pattern.compile(DATE_H_REGEX), "yyyy-M-d H"),
        DATE_HM(Pattern.compile(DATE_HM_REGEX), "yyyy-M-d H:m"),
        DATE_HMS(Pattern.compile(DATE_HMS_REGEX), "yyyy-M-d H:m:s"),
        DATE_HMS_M(Pattern.compile(DATE_HMS_M_REGEX), "yyyy-M-d H:m:s.SSS");

        private Pattern pattern;
        private String format;

        DATE_FORMAT_ENUM(Pattern pattern, String format) {
            this.pattern = pattern;
            this.format = format;
        }

        static Date formatDate(String timeString) throws Exception {
            timeString = prepare(timeString);
            for (DATE_FORMAT_ENUM formatEnum : values()) {
                Matcher matcher = formatEnum.pattern.matcher(timeString);
                if (matcher.find()) {
                    SimpleDateFormat sdf = new SimpleDateFormat(formatEnum.format);
                    return sdf.parse(timeString);
                }
            }
            throw new Exception("Unparseable date:" + timeString);
        }

        private static String prepare(String timeString) {
            String s = null;
            if (!StringUtils.isEmpty(timeString)) {
                if (timeString.contains("-")) {
                    s = timeString;
                } else if (timeString.contains("/")) {
                    s = timeString.replaceAll("[/]", "-");
                } else {
                    s = timeString.substring(0, 4) + "-" + timeString.substring(4, 6) + "-" + timeString.substring(6);
                }
                int dotStart = s.indexOf(".") + 1;
                boolean hasDot = dotStart > 0;
                int msLength = dotStart + 3;
                int overMsLength = s.length() - msLength;
                int lessMsLength = msLength - s.length();

                if (hasDot && overMsLength >= 0) {
                    return s.substring(0, s.length() - overMsLength);
                } else if (hasDot && lessMsLength >= 0) {
                    for (int i = 0; i < lessMsLength; i++) {
                        s += "0";
                    }
                    return s;
                }

                if (hasDot) {
                    s += ".000";
                }
            }

            return s;
        }
    }
    
    private DateUtils() {

    }
    
    public static Date toDate(String timeString) throws Exception {
        if (StringUtils.isEmpty(timeString)) {
            return null;
        }
        return DATE_FORMAT_ENUM.formatDate(timeString);
    }
    
    public static String toyyyyMMddHHmmss(long currentTime) {
        Date date = new Date(currentTime);
        return dateFormat(date, "yyyyMMddHHmmss");
    }
    
    public static String toyyyyMMddHHmmss(Date date) {
    	return dateFormat(date, "yyyyMMddHHmmss");
    }
    
    public static Date toDate(DateTime dateTime) {
        if (null == dateTime) {
            return null;
        }
        return dateTime.toDate();
    }
    
    public static DateTime toDateTime(String timeString) throws Exception {
        if (StringUtils.isEmpty(timeString)) {
            return null;
        }
        return toDateTime(toDate(timeString));
    }
    
    public static DateTime toDateTime(Date date) {
        if (null == date) {
            return null;
        }
        return new DateTime(date);
    }
    
    public static Timestamp toTimestamp(String timeString) throws Exception {
        if (StringUtils.isEmpty(timeString)) {
            return null;
        }
        return toTimestamp(toDate(timeString));
    }
    
    public static Timestamp toTimestamp(Date date) {
        if (null == date) {
            return null;
        }
        return new Timestamp(date.getTime());
    }
    
    public static Timestamp toTimestamp(DateTime dateTime) throws Exception {
        if (null == dateTime) {
            return null;
        }
        return toTimestamp(toDate(dateTime));
    }
    
    public static java.sql.Date toSqlDate(Date date) {
        if (null == date) {
            return null;
        }
        return new java.sql.Date(date.getTime());
    }
    
    public static Date getNow() {
        return new Date();
    }
    
    public static Date dateFormat(String date, String dateFormat) {
        if (date == null) {
        	return null;
        }
		SimpleDateFormat format = new SimpleDateFormat(dateFormat);
		try {
			return format.parse(date);
		} catch (Exception ex) {
		}
		return null;
    }

    public static String dateFormat(Date date, String dateFormat) {
        if (date == null) {
        	return "";
        }
		SimpleDateFormat format = new SimpleDateFormat(dateFormat);
		return format.format(date);
    }
    
    public static Date add(Date date, int field, int amount) {

        if (date == null) {
            date = new Date();
        }

        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(field, amount);

        return cal.getTime();
    }
    
    public static String getAWeekBeforeYYYYMMDD() {
    	Date date = add(null, Calendar.DAY_OF_MONTH, -7);
        return dateFormat(date, "yyyyMMdd");
    }
    
    public static String getAMonthBeforeYYYYMMDD() {
    	Date date = add(null, Calendar.MONTH, -7);
        return dateFormat(date, "yyyyMMdd");
    }
}
