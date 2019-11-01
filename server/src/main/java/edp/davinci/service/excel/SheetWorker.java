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

package edp.davinci.service.excel;

import com.google.common.base.Stopwatch;
import com.google.common.collect.Maps;
import edp.core.model.QueryColumn;
import edp.core.utils.CollectionUtils;
import edp.core.utils.SqlUtils;
import edp.davinci.core.enums.ActionEnum;
import edp.davinci.dto.cronJobDto.MsgMailExcel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.ResultSetMetaData;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import static edp.core.consts.Consts.QUERY_META_SQL;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 18:23
 * To change this template use File | Settings | File Templates.
 */
@Slf4j
public class SheetWorker<T> extends AbstractSheetWriter implements Callable {
    private SheetContext context;

    private int maxRows = 1000000;

    public SheetWorker(SheetContext context) {
        this.context = context;
    }

    @Override
    public T call() throws Exception {
        Stopwatch watch = Stopwatch.createStarted();
        Boolean rst = true;
        try {
            JdbcTemplate template = context.getSqlUtils().jdbcTemplate();
            propertiesSet(template);
            buildQueryColumn(template);
            super.init(context);
            super.writeHeader(context);
            template.setMaxRows(context.getResultLimit() > 0 && context.getResultLimit() <= maxRows ? context.getResultLimit() : maxRows);
            template.setFetchSize(500);

            String sql = context.getQuerySql().get(context.getQuerySql().size() - 1);
            Set<String> queryFromsAndJoins = SqlUtils.getQueryFromsAndJoins(sql);
            if (context.getCustomLogger() != null) {
                context.getCustomLogger().info("Task ({}) -- {} start query", context.getTaskKey(), context.getName());
            }
            template.query(sql, rs -> {
                Map<String, Object> dataMap = Maps.newHashMap();
                for (int i = 1; i <= rs.getMetaData().getColumnCount(); i++) {
                    dataMap.put(SqlUtils.getColumnLabel(queryFromsAndJoins, rs.getMetaData().getColumnLabel(i)), rs.getObject(rs.getMetaData().getColumnLabel(i)));
                }
                writeLine(context, dataMap);
            });
            if (context.getCustomLogger() != null) {
                context.getCustomLogger().info("Task ({}) -- {} finish query", context.getTaskKey(), context.getName());
            }
            super.refreshHeightWidth(context);
        } catch (Exception e) {
            log.error("sheet worker error,  task={}, context={}, error={}", context.getTaskKey(), context.toString(), e);
            if (context.getCustomLogger() != null) {
                context.getCustomLogger().error("sheet worker error,  task={}, context={}, error={}", context.getTaskKey(), context.toString(), e);
            }
            if (context.getWrapper().getAction() == ActionEnum.MAIL) {
                MsgMailExcel msg = (MsgMailExcel) context.getWrapper().getMsg();
                msg.setDate(new Date());
                msg.setException(e);
            }
            rst = false;
        }

        if (context.getWrapper().getAction() == ActionEnum.DOWNLOAD) {
            Object[] args = {context.getTaskKey(), rst, context.getWrapper().getAction(), context.getWrapper().getxId(),
                    context.getSheet().getSheetName(), context.getDashboardId(), context.getWidgetId()
                    , watch.elapsed(TimeUnit.MILLISECONDS)};
            log.info("sheet worker complete task={}, status={},action={},xid={},sheetName={},dashboardId={},widgetId={},cost={}ms", args);
            if (context.getCustomLogger() != null) {
                context.getCustomLogger().info("sheet worker complete task={}, status={},action={},xid={},sheetName={},dashboardId={},widgetId={},cost={}ms", args);
            }
        } else if (context.getWrapper().getAction() == ActionEnum.SHAREDOWNLOAD) {
            Object[] args = {context.getTaskKey(), rst, context.getWrapper().getAction(), context.getWrapper().getxUUID(),
                    context.getSheet().getSheetName(), context.getDashboardId(), context.getWidgetId()
                    , watch.elapsed(TimeUnit.MILLISECONDS)};
            log.info("sheet worker complete task={}, status={},action={},xUUID={},sheetName={},dashboardId={},widgetId={},cost={}ms", args);
            if (context.getCustomLogger() != null) {
                context.getCustomLogger().info("sheet worker complete task={}, status={},action={},xUUID={},sheetName={},dashboardId={},widgetId={},cost={}ms", args);
            }
        }

        return (T) rst;
    }


    private void propertiesSet(JdbcTemplate template) {
        if (!CollectionUtils.isEmpty(context.getExecuteSql())) {
            context.getExecuteSql().stream().filter(x -> x != null).forEach(x -> {
                String sql = SqlUtils.filterAnnotate(x);
                SqlUtils.checkSensitiveSql(sql);
                template.execute(sql);
            });
        }
        if (!CollectionUtils.isEmpty(context.getQuerySql())) {
            for (int i = 0; i < context.getQuerySql().size() - 1; i++) {
                String sql = SqlUtils.filterAnnotate(context.getQuerySql().get(i));
                SqlUtils.checkSensitiveSql(sql);
                template.execute(sql);
            }
        }
    }

    private void buildQueryColumn(JdbcTemplate template) {
        template.setMaxRows(1);
        String sql = context.getQuerySql().get(context.getQuerySql().size() - 1);
        sql = String.format(QUERY_META_SQL, sql);
        Set<String> queryFromsAndJoins = SqlUtils.getQueryFromsAndJoins(sql);
        template.query(sql, rs -> {
            ResultSetMetaData metaData = rs.getMetaData();
            List<QueryColumn> totalColumns = new ArrayList<>();
            List<QueryColumn> queryColumns = new ArrayList<>();
            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                String label = SqlUtils.getColumnLabel(queryFromsAndJoins, metaData.getColumnLabel(i));
                totalColumns.add(new QueryColumn(label, metaData.getColumnTypeName(i)));
                if (!CollectionUtils.isEmpty(context.getExcludeColumns()) && context.getExcludeColumns().contains(label)) {
                    continue;
                }
                queryColumns.add(new QueryColumn(label, metaData.getColumnTypeName(i)));
            }
            if (CollectionUtils.isEmpty(totalColumns) || CollectionUtils.isEmpty(queryColumns)) {
                throw new IllegalArgumentException("can not find any QueryColumn,widgetId=" + context.getWidgetId()
                        + ",sql=" + context.getQuerySql().get(context.getQuerySql().size() - 1));
            }
            context.setTotalColumns(totalColumns);
            context.setQueryColumns(queryColumns);
            return context;
        });
    }
}
