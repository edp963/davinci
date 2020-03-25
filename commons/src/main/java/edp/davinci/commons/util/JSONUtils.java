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
 *
 */

package edp.davinci.commons.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

public class JSONUtils {
	
    private JSONUtils() {

    }
    
	public static boolean validate(String jsonString) {

		jsonString = jsonString.trim();

		if (StringUtils.isEmpty(jsonString)) {
			return false;
		}

		try {
			JSON.parse(jsonString);
		} catch (Exception e) {
			return false;
		}

		return true;
	}
	
	public static String toString(Object obj) {
		return toString(obj, false);
	}

	public static String toString(Object obj, boolean prettyFormat) {
		return JSON.toJSONString(obj, prettyFormat);
	}
	
    public static <T> T toObject(String jsonString, Class<T> c) {

    	if (null == c || StringUtils.isEmpty(jsonString)) {
            return null;
        }

        return JSON.parseObject(jsonString, c);
    }

    public static <T> List<T> toObjectArray(String jsonString, Class<T> c) {

        if (null == c || StringUtils.isEmpty(jsonString)) {
            return Collections.emptyList();
        }

        return JSON.parseArray(jsonString, c);
    }
}
