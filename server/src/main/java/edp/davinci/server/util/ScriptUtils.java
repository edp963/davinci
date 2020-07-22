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

import static edp.davinci.commons.Constants.EMPTY;
import static edp.davinci.server.commons.Constants.EXCEL_FORMAT_TYPE_KEY;

import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import com.fasterxml.jackson.databind.ObjectMapper;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.data.pojo.Aggregator;
import edp.davinci.data.pojo.Order;
import edp.davinci.data.pojo.Param;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dto.view.WidgetQueryParam;
import edp.davinci.server.enums.FieldFormatTypeEnum;
import edp.davinci.server.enums.NumericUnitEnum;
import edp.davinci.server.model.ExcelHeader;
import edp.davinci.server.model.FieldCurrency;
import edp.davinci.server.model.FieldCustom;
import edp.davinci.server.model.FieldDate;
import edp.davinci.server.model.FieldNumeric;
import edp.davinci.server.model.FieldPercentage;
import edp.davinci.server.model.FieldScientificNotation;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Source;
import org.graalvm.polyglot.Value;

public class ScriptUtils {
    private final static String LANGUAGE = "js";
    private final static String FUNC_FIELDSHEADER = "getFieldsHeader";
    private final static String FUNC_DASHBOARDITEMEXECUTEPARAM = "getDashboardItemExecuteParam";

    private static ClassLoader classLoader = ScriptUtils.class.getClassLoader();

    private enum ScriptEnum {
        INSTANCE;

        private Value getFieldsHeader;
        private Value getDashboardItemExecuteParam;

        ScriptEnum() {
            try {
                getFieldsHeader = createScriptEngine(Constants.FORMAT_CELL_VALUE_JS, FUNC_FIELDSHEADER);
                getDashboardItemExecuteParam = createScriptEngine(Constants.FORMAT_QUERY_PARAM_JS, FUNC_DASHBOARDITEMEXECUTEPARAM);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        private static Value createScriptEngine(String path, String member) throws Exception {
            Context context = Context.create(LANGUAGE);
            Source source = Source.newBuilder(LANGUAGE, classLoader.getResource(path)).build();
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
}
