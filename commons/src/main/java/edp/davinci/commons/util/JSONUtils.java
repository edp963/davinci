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

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonParser.Feature;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public class JSONUtils {
	
    private JSONUtils() {

    }
    
	private static void config(ObjectMapper mapper) {
		mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
		mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
		mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
		mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
		mapper.enable(Feature.ALLOW_COMMENTS);
		mapper.enable(Feature.ALLOW_UNQUOTED_FIELD_NAMES);
		mapper.enable(Feature.ALLOW_SINGLE_QUOTES);
		mapper.enable(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS);
	}
    
	public static boolean validateObj(String jsonString) {

		jsonString = jsonString.trim();
		
		if (StringUtils.isEmpty(jsonString)) {
			return false;
		}

		try {
			ObjectMapper mapper = new ObjectMapper();
			mapper.readValue(jsonString, Map.class);
		} catch (Exception e) {
			return false;
		}

		return true;
	}
	
	public static boolean validateArray(String jsonString) {

		jsonString = jsonString.trim();

		if (StringUtils.isEmpty(jsonString)) {
			return false;
		}

		try {
			ObjectMapper mapper = new ObjectMapper();
			mapper.readValue(jsonString, mapper.getTypeFactory().constructParametricType(ArrayList.class, Map.class));
		} catch (Exception e) {
			return false;
		}

		return true;
	}
	
	public static String toString(Object obj) {
		return toString(obj, false);
	}

	public static String toString(Object obj, boolean prettyFormat) {
		ObjectMapper mapper = new ObjectMapper();
		config(mapper);
		mapper.enable(SerializationFeature.INDENT_OUTPUT);

		try {
			return mapper.writeValueAsString(obj);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		
		return null;
	}
	
    public static <T> T toObject(String jsonString, Class<T> c) {

    	if (null == c || StringUtils.isEmpty(jsonString)) {
            return null;
        }
    	
    	ObjectMapper mapper = new ObjectMapper();
    	config(mapper);

        try {
			return mapper.readValue(jsonString, c);
		} catch (Exception e) {
			e.printStackTrace();
		}
        
        return null;
    }

    public static <T> List<T> toObjectArray(String jsonString, Class<T> c) {

        if (null == c || StringUtils.isEmpty(jsonString)) {
            return Collections.emptyList();
        }

        ObjectMapper mapper = new ObjectMapper();
    	config(mapper);

    	try {
			return mapper.readValue(jsonString, mapper.getTypeFactory().constructParametricType(ArrayList.class, c));
		} catch (Exception e) {
			e.printStackTrace();
		}
    	
    	return null;
    }
    
    public static Object convertJO2POJO(Object data) {

        Class<?> dCls = data.getClass();

        if (JSONObject.class.isAssignableFrom(dCls)) {

            Map<String, Object> m = new LinkedHashMap<String, Object>();

            JSONObject jod = (JSONObject) data;

            for (String key : jod.keySet()) {

                Object attr = jod.get(key);

                Object attrObj = convertJO2POJO(attr);

                m.put(key, attrObj);
            }

            return m;

        }
        else if (JSONArray.class.isAssignableFrom(dCls)) {

            List<Object> l = new ArrayList<Object>();

            JSONArray joa = (JSONArray) data;

            for (Object o : joa) {

                Object attrObj = convertJO2POJO(o);

                l.add(attrObj);
            }

            return l;

        }

        return data;
    }
}
