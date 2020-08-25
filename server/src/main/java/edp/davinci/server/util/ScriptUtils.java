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

package edp.davinci.server.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.data.pojo.Param;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dto.view.WidgetQueryParam;
import edp.davinci.server.model.ExcelHeader;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Source;
import org.graalvm.polyglot.Value;

public class ScriptUtils {
    private final static String LANGUAGE = "js";
    private final static String FUNC_FIELDS_HEADER = "getFieldsHeader";
    private final static String FUNC_DASHBOARD_ITEM_EXECUTE_PARAM = "getDashboardItemExecuteParam";
    private static final String FUNC_FORMATTED_DATA_ROWS = "getFormattedDataRows";

    private static final ClassLoader classLoader = ScriptUtils.class.getClassLoader();

    private enum ScriptEnum {
        INSTANCE;

        private Value getFieldsHeader;
        private Value getDashboardItemExecuteParam;
        private Value getFormattedDataRows;

        ScriptEnum() {
            try {
                getFieldsHeader = createScriptEngine(Constants.FORMAT_CELL_VALUE_JS, FUNC_FIELDS_HEADER);
                getFormattedDataRows = createScriptEngine(Constants.FORMAT_CELL_VALUE_JS, FUNC_FORMATTED_DATA_ROWS);
                getDashboardItemExecuteParam = createScriptEngine(Constants.FORMAT_QUERY_PARAM_JS, FUNC_DASHBOARD_ITEM_EXECUTE_PARAM);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        private static Value createScriptEngine(String path, String member) throws Exception {
            Context context = Context.create(LANGUAGE);
            Source source = Source.newBuilder(LANGUAGE, Objects.requireNonNull(classLoader.getResource(path))).build();
            context.eval(source);
            Value function = context.getBindings(LANGUAGE).getMember(member);
            return function.canExecute() ? function : null;
        }
    }


    public static synchronized WidgetQueryParam getWidgetQueryParam(String dashboardConfig, String widgetConfig,
            Long releationId) {

        Value fun = ScriptEnum.INSTANCE.getDashboardItemExecuteParam;
        Value result = fun.execute(dashboardConfig, widgetConfig, releationId);
        WidgetQueryParam queryParam = JSONUtils.toObject(result.asString(), WidgetQueryParam.class);
        return queryParam;
    }

    public static synchronized List<ExcelHeader> getExcelHeader(String json, List<Param> params) {

        Value fun = ScriptEnum.INSTANCE.getFieldsHeader;
        Value result = fun.execute(json, JSONUtils.toString(params));
        List<ExcelHeader> excelHeaders = JSONUtils.toObjectArray(result.toString(), ExcelHeader.class);
        return excelHeaders;
    }

    public static synchronized List<Map<String, Object>> formatCellValue(String json, List<Map<String, Object>> params) {

        Value js = ScriptEnum.INSTANCE.getFormattedDataRows;
        Value result = js.execute(json, JSONUtils.toString(params));
        List<Map> resultMaps = JSONUtils.toObjectArray(result.toString(), Map.class);
        List<Map<String, Object>> values = new ArrayList<>();
        if (!CollectionUtils.isEmpty(resultMaps)) {
            resultMaps.forEach(v -> values.add((Map<String, Object>) v));
        }
        return values;
    }
}
