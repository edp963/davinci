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
import edp.davinci.core.common.Constants;
import edp.davinci.core.model.ExcelHeader;
import edp.davinci.dto.viewDto.Param;
import edp.davinci.dto.viewDto.SimpleView;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Source;
import org.graalvm.polyglot.Value;

import java.util.List;
import java.util.Objects;
import java.util.Set;

public class ScriptUtils {

    private static final String LANGUAGE = "js";
    private static final String FUNC_FIELDS_HEADER = "getFieldsHeader";
    private static final String FUNC_DASHBOARD_ITEM_EXECUTE_PARAM = "getDashboardItemExecuteParam";

    private static final ClassLoader classLoader = ScriptUtils.class.getClassLoader();

    private enum ScriptEnum {
        INSTANCE;

        private Value tableFormatJs;
        private Value executeParamFormatJs;

        ScriptEnum() {
            try {
                tableFormatJs = createScriptEngine(Constants.TABLE_FORMAT_JS, FUNC_FIELDS_HEADER);
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


    public static synchronized ViewExecuteParam getViewExecuteParam(String dashboardConfig, String widgetConfig, Set<SimpleView> views,
                                                                    Long relationId) {

        Value js = ScriptEnum.INSTANCE.executeParamFormatJs;
        Value result = js.execute(dashboardConfig, widgetConfig, JSON.toJSONString(views), relationId);
        ViewExecuteParam viewExecuteParam = JSONObject.parseObject(result.asString(), ViewExecuteParam.class);
        return viewExecuteParam;
    }

    public static synchronized List<ExcelHeader> formatHeader(String widgetConfig, List<Param> params) {

        Value js = ScriptEnum.INSTANCE.tableFormatJs;
        Value result = js.execute(widgetConfig, JSON.toJSONString(params));
        List<ExcelHeader> excelHeaders = JSONArray.parseArray(result.toString(), ExcelHeader.class);
        return excelHeaders;
    }
}