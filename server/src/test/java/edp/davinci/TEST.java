/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2018 EDP
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

package edp.davinci;

import jdk.nashorn.api.scripting.JSObject;
import jdk.nashorn.api.scripting.NashornScriptEngine;
import jdk.nashorn.api.scripting.ScriptObjectMirror;
import scala.Int;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import java.io.BufferedReader;
import java.io.FileReader;
import java.util.*;

public class TEST {

    public static void main(String[] args) throws Exception {
        String path = "/Users/shan/Desktop/formatCellValue.js";

        ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
        engine.eval(new FileReader(path));

        System.out.println();

        Invocable invocable = (Invocable) engine;

        long l1 = System.currentTimeMillis();
        System.out.println(l1);

        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            list.add(12345678 + i);
        }


//        String json = "{\"formatType\":\"currency\",\"currency\":{\"decimalPlaces\":3,\"unit\":\"万\",\"useThousandSeparator\":true,\"prefix\":\"\",\"suffix\":\"元\"}}";
//
////        String json = "{\"formatType\":\"percentage\",\"percentage\":{\"decimalPlaces\":2}}";
//        JSObject jsObject = (JSObject) invocable.invokeFunction("getFormattedValues", list, json);
////
//        System.out.println(invocable.invokeFunction("formatByThousandSeperator", 12345678, true));
//
//
//        System.out.println(System.currentTimeMillis() - l1);
//
//        Collection<Object> values = jsObject.values();
//
//        for (Object object : values) {
//            System.out.println(object.toString().replaceAll(",{2}", ","));
//        }

        List<Map<String, Object>> mapList = new ArrayList<>();
        for (int i = 0; i < 10; ++i) {
            Map<String, Object> map = new HashMap<>();
            Map<String, Object> objectMap = new HashMap<>();
            objectMap.put(i + "", i);
            if (i % 2 == 0) {
                map.put("A" + i, objectMap);
            } else {
                map.put("A" + i, i);
            }
            mapList.add(map);
        }
        System.out.println(mapList.size());
        Object obj = invocable.invokeFunction("test", mapList);


        System.out.println(obj);
    }
}
