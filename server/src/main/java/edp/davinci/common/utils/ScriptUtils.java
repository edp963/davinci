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

package edp.davinci.common.utils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.common.collect.Lists;
import edp.core.utils.CollectionUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.model.ExcelHeader;
import edp.davinci.dto.viewDto.Param;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Source;
import org.graalvm.polyglot.Value;

import java.util.List;
import java.util.Map;
import java.util.Objects;

public class ScriptUtils {

    private static final String LANGUAGE = "js";
    private static final String FUNC_FIELDS_HEADER = "getFieldsHeader";
    private static final String FUNC_DASHBOARD_ITEM_EXECUTE_PARAM = "getDashboardItemExecuteParam";
    private static final String FUNC_FORMATTED_DATA_ROWS = "getFormattedDataRows";

    private static final ClassLoader classLoader = ScriptUtils.class.getClassLoader();

    private enum ScriptEnum {
        INSTANCE;


        private Value tableFormatJs;
        private Value executeParamFormatJs;
        private Value formatDataRowsJs;

        ScriptEnum() {
            try {
                tableFormatJs = createScriptEngine(Constants.TABLE_FORMAT_JS, FUNC_FIELDS_HEADER);
                formatDataRowsJs = createScriptEngine(Constants.TABLE_FORMAT_JS, FUNC_FORMATTED_DATA_ROWS);
                executeParamFormatJs = createScriptEngine(Constants.EXECUTE_PARAM_FORMAT_JS, FUNC_DASHBOARD_ITEM_EXECUTE_PARAM);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        private static Value createScriptEngine(String sourcePath, String member) throws Exception {
            Context context = Context.create(LANGUAGE);
            Source source = Source.newBuilder(LANGUAGE, Objects.requireNonNull(classLoader.getResource(sourcePath))).build();
            context.eval(source);
            Value function = context.getBindings(LANGUAGE).getMember(member);
            return function.canExecute() ? function : null;
        }
    }


    public static synchronized ViewExecuteParam getViewExecuteParam(String dashboardConfig, String widgetConfig,
                                                                    Long releationId) {

        Value js = ScriptEnum.INSTANCE.executeParamFormatJs;
        Value result = js.execute(dashboardConfig, widgetConfig, releationId);
        ViewExecuteParam viewExecuteParam = JSONObject.parseObject(result.asString(), ViewExecuteParam.class);
        return viewExecuteParam;
    }

    public static synchronized List<ExcelHeader> formatHeader(String json, List<Param> params) {

        Value js = ScriptEnum.INSTANCE.tableFormatJs;
        Value result = js.execute(json, JSON.toJSONString(params));
        List<ExcelHeader> excelHeaders = JSONArray.parseArray(result.toString(), ExcelHeader.class);
        return excelHeaders;
    }


    public static synchronized List<Map<String, Object>> formatCellValue(String json, List<Map<String, Object>> params) {

        Value js = ScriptEnum.INSTANCE.formatDataRowsJs;
        Value result = js.execute(json, JSON.toJSONString(params));
        List<Map> maps = JSONArray.parseArray(result.toString(), Map.class);
        List<Map<String, Object>> formattedValues = Lists.newArrayList();
        if (!CollectionUtils.isEmpty(maps)) {
            maps.forEach(v -> formattedValues.add((Map<String, Object>) v));
        }
        return formattedValues;
    }
}