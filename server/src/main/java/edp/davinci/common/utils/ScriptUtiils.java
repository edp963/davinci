/*
 * << Davinci == Copyright (C) 2016 - 2019 EDP == Licensed under the Apache License, Version 2.0 (the "License"); you
 * may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions and limitations under the
 * License. >>
 *
 */

package edp.davinci.common.utils;

import com.alibaba.druid.util.StringUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.FieldFormatTypeEnum;
import edp.davinci.core.enums.NumericUnitEnum;
import edp.davinci.core.model.*;
import edp.davinci.dto.viewDto.Aggregator;
import edp.davinci.dto.viewDto.Order;
import edp.davinci.dto.viewDto.Param;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.springframework.stereotype.Component;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.InputStreamReader;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static edp.core.consts.Consts.EMPTY;
import static edp.davinci.core.common.Constants.EXCEL_FORMAT_TYPE_KEY;

@Component
public class ScriptUtiils {

    private static ClassLoader classLoader = ScriptUtiils.class.getClassLoader();

    public static ScriptEngine getCellValueScriptEngine() throws Exception {

        ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
        engine.eval(new InputStreamReader(classLoader.getResourceAsStream(Constants.TABLE_FORMAT_JS)));
        return engine;
    }

    public static ScriptEngine getExecuptParamScriptEngine() throws Exception {

        ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
        engine.eval(new InputStreamReader(classLoader.getResourceAsStream(Constants.EXECUTE_PARAM_FORMAT_JS)));
        return engine;
    }

    public static ViewExecuteParam getViewExecuteParam(ScriptEngine engine, String dashboardConfig, String widgetConfig,
            Long releationId) {

        try {
            Invocable invocable = (Invocable) engine;
            Object obj = invocable.invokeFunction("getDashboardItemExecuteParam", dashboardConfig, widgetConfig,
                    releationId);

            if (obj instanceof ScriptObjectMirror) {
                ScriptObjectMirror vsom = (ScriptObjectMirror) obj;
                List<String> groups = new ArrayList<>();
                List<Aggregator> aggregators = new ArrayList<>();
                List<Order> orders = new ArrayList<>();
                List<String> filters = new ArrayList<>();
                Boolean cache = false;
                Boolean nativeQuery = false;

                Long expired = 0L;
                List<Param> params = new ArrayList<>();
                for (String key : vsom.keySet()) {
                    switch (key) {
                        case "groups":
                            ScriptObjectMirror groupMirror = (ScriptObjectMirror) vsom.get(key);
                            if (groupMirror.isArray()) {
                                Collection<Object> values = groupMirror.values();
                                values.forEach(v -> groups.add(String.valueOf(v)));
                            }
                            break;
                        case "aggregators":
                            ScriptObjectMirror aggregatorsMirror = (ScriptObjectMirror) vsom.get(key);
                            if (aggregatorsMirror.isArray()) {
                                Collection<Object> values = aggregatorsMirror.values();
                                values.forEach(v -> {
                                    ScriptObjectMirror agg = (ScriptObjectMirror) v;
                                    Aggregator aggregator = new Aggregator(String.valueOf(agg.get("column")),
                                            String.valueOf(agg.get("func")));
                                    aggregators.add(aggregator);
                                });
                            }
                            break;
                        case "orders":
                            ScriptObjectMirror ordersMirror = (ScriptObjectMirror) vsom.get(key);
                            if (ordersMirror.isArray()) {
                                Collection<Object> values = ordersMirror.values();
                                values.forEach(v -> {
                                    ScriptObjectMirror agg = (ScriptObjectMirror) v;
                                    Order order = new Order(String.valueOf(agg.get("column")),
                                            String.valueOf(agg.get("direction")));
                                    orders.add(order);
                                });
                            }
                            break;
                        case "filters":
                            Object o = vsom.get(key);
                            if (o instanceof String) {
                                String filtersJsonStr = (String) o;
                                if (!StringUtils.isEmpty(filtersJsonStr)) {
                                    filters.add(filtersJsonStr);
                                }
                            }
                            else if (o instanceof ScriptObjectMirror) {
                                ScriptObjectMirror filterMirror = (ScriptObjectMirror) o;
                                if (filterMirror.isArray() && filterMirror.size() > 0) {
                                    Collection<Object> values = filterMirror.values();
                                    values.forEach(v -> {
                                        if (v != null) {
                                            filters.add(String.valueOf(v));
                                        }
                                    });
                                }
                            }
                            break;
                        case "cache":
                            cache = (Boolean) vsom.get(key);
                            break;
                        case "expired":
                            expired = Long.parseLong(String.valueOf(vsom.get(key)));
                            break;
                        case "params":
                            ScriptObjectMirror paramsMirror = (ScriptObjectMirror) vsom.get(key);
                            if (paramsMirror.isArray()) {
                                Collection<Object> values = paramsMirror.values();
                                values.forEach(v -> {
                                    ScriptObjectMirror agg = (ScriptObjectMirror) v;
                                    Param param = new Param(String.valueOf(agg.get("name")),
                                            String.valueOf(agg.get("value")));
                                    params.add(param);
                                });
                            }
                            break;
                        case "nativeQuery":
                            nativeQuery = (Boolean) vsom.get(key);
                            break;
                        default:
                            break;
                    }
                }

                return new ViewExecuteParam(groups, aggregators, orders, filters, params, cache, expired, nativeQuery);
            }

        }
        catch (ScriptException e) {
            e.printStackTrace();
        }
        catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static List<ExcelHeader> formatHeader(ScriptEngine engine, String json, List<Param> params) {

        try {
            Invocable invocable = (Invocable) engine;
            Object obj = invocable.invokeFunction("getFieldsHeader", json, params);

            if (!(obj instanceof ScriptObjectMirror)) {
                return null;
            }

            ScriptObjectMirror som = (ScriptObjectMirror) obj;

            if (!som.isArray()) {
                return null;
            }

            final List<ExcelHeader> excelHeaders = new ArrayList<>();
            Collection<Object> values = som.values();
            values.forEach(v -> {
                ExcelHeader header = new ExcelHeader();
                ScriptObjectMirror vsom = (ScriptObjectMirror) v;
                for (String key : vsom.keySet()) {

                    if (StringUtils.isEmpty(key)) {
                        continue;
                    }

                    Object o = vsom.get(key);
                    if (null == o) {
                        continue;
                    }
                    
                    String setter = "set" + String.valueOf(key.charAt(0)).toUpperCase() + key.substring(1);
                    Class clazz = o.getClass();

                    try {
                        if (o instanceof ScriptObjectMirror) {
                            ScriptObjectMirror mirror = (ScriptObjectMirror) o;
                            if ("range".equals(key)) {
                                if (mirror.isArray()) {
                                    int[] array = new int[4];
                                    for (int i = 0; i < 4; i++) {
                                        array[i] = Integer.parseInt(mirror.get(i + EMPTY).toString());
                                    }
                                    header.setRange(array);
                                }
                            }
                            else if ("style".equals(key)) {
                                if (mirror.isArray()) {
                                    List<String> list = new ArrayList<>();
                                    for (int i = 0; i < 4; i++) {
                                        list.add(mirror.get(i + EMPTY).toString());
                                    }
                                    header.setStyle(list);
                                }
                            }
                            else if ("format".equals(key)) {
                                String formatType = mirror.get(EXCEL_FORMAT_TYPE_KEY).toString();
                                ScriptObjectMirror format = (ScriptObjectMirror) mirror.get(formatType);

                                if (null != format) {
                                    FieldFormatTypeEnum typeEnum = FieldFormatTypeEnum.typeOf(formatType);
                                    ObjectMapper mapper = new ObjectMapper();

                                    NumericUnitEnum numericUnit = null;
                                    if (format.containsKey("unit")) {
                                        numericUnit = NumericUnitEnum.unitOf(String.valueOf(format.get("unit")));
                                    }

                                    switch (typeEnum) {
                                        case Currency:
                                            FieldCurrency fieldCurrency = mapper.convertValue(format,
                                                    FieldCurrency.class);
                                            if (null != fieldCurrency) {
                                                fieldCurrency.setUnit(numericUnit);
                                                header.setFormat(fieldCurrency);
                                            }
                                            break;
                                        case Custom:
                                            FieldCustom fieldCustom = mapper.convertValue(format, FieldCustom.class);
                                            header.setFormat(fieldCustom);
                                            break;
                                        case Date:
                                            FieldDate fieldDate = mapper.convertValue(format, FieldDate.class);
                                            header.setFormat(fieldDate);
                                            break;
                                        case Numeric:
                                            FieldNumeric fieldNumeric = mapper.convertValue(format, FieldNumeric.class);
                                            fieldNumeric.setUnit(numericUnit);
                                            header.setFormat(fieldNumeric);
                                            break;
                                        case Percentage:
                                            FieldPercentage fieldPercentage = mapper.convertValue(format,
                                                    FieldPercentage.class);
                                            header.setFormat(fieldPercentage);
                                            break;
                                        case ScientificNotation:
                                            FieldScientificNotation scientificNotation = mapper.convertValue(format,
                                                    FieldScientificNotation.class);
                                            header.setFormat(scientificNotation);
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }

                        }
                        else {
                            Method method = header.getClass().getMethod(setter, clazz);
                            method.invoke(header, vsom.get(key));
                        }
                    }
                    catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                excelHeaders.add(header);
            });
            return excelHeaders;
        }
        catch (ScriptException e) {
            e.printStackTrace();
        }
        catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
        return null;
    }
}
