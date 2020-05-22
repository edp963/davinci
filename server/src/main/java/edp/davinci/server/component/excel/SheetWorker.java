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

package edp.davinci.server.component.excel;

import com.google.common.base.Stopwatch;
import com.google.common.collect.Maps;

import edp.davinci.server.config.SpringContextHolder;
import edp.davinci.server.dto.cronjob.MsgMailExcel;
import edp.davinci.server.enums.ActionEnum;
import edp.davinci.server.model.PagingWithQueryColumns;
import edp.davinci.server.model.QueryColumn;
import edp.davinci.server.service.ViewService;
import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.util.AuthVarUtils;
import edp.davinci.server.util.DataUtils;
import lombok.extern.slf4j.Slf4j;

import org.springframework.jdbc.core.JdbcTemplate;

import static edp.davinci.server.enums.DatabaseTypeEnum.MYSQL;

import java.sql.ResultSetMetaData;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 18:23
 * To change this template use File | Settings | File Templates.
 */
@Slf4j
public class SheetWorker<T> extends AbstractSheetWriter implements Callable {

	private SheetContext sheetContext;

    public SheetWorker(SheetContext sheetContext) {
        this.sheetContext = sheetContext;
    }

    @Override
    public T call() {

        Boolean rst = true;
        Stopwatch watch = Stopwatch.createStarted();
        final AtomicInteger count = new AtomicInteger(0);
        try {
            PagingWithQueryColumns paging = ((ViewService) SpringContextHolder.getBean(ViewService.class))
                    .getDataWithQueryColumns(sheetContext.getViewId(), sheetContext.getExecuteParam(),
                            sheetContext.getUser());
            List<Map<String, Object>> resultList = paging.getResultList();
            sheetContext.setQueryColumns(paging.getColumns());
            super.init(sheetContext);
            super.writeHeader(sheetContext);

            resultList.forEach(row -> {
                writeLine(sheetContext, row);
                count.incrementAndGet();
            });
            
            if (sheetContext.getCustomLogger() != null) {
                sheetContext.getCustomLogger().info(
                        "Task({}) sheet worker(name:{}, sheetNo:{}, sheetName:{}) finish query count:{}",
                        sheetContext.getTaskKey(), sheetContext.getName(), sheetContext.getSheetNo(),
                        sheetContext.getSheet().getSheetName(), count.get());
            }
            super.refreshHeightWidth(sheetContext);
        } catch (Exception e) {
            if (sheetContext.getWrapper().getAction() == ActionEnum.MAIL) {
                MsgMailExcel msg = (MsgMailExcel) sheetContext.getWrapper().getMsg();
                msg.setDate(new Date());
                msg.setException(e);
            }
            if (sheetContext.getCustomLogger() != null) {
                sheetContext.getCustomLogger().error(
                        "Task({}) sheet worker(name:{}, sheetNo:{}, sheetName:{}) error, error={}",
                        sheetContext.getTaskKey(), sheetContext.getName(), sheetContext.getSheetNo(),
                        sheetContext.getSheet().getSheetName(), e.getMessage());
            }
            log.error(e.getMessage(), e);
            rst = false;
        }

        Object[] args = { sheetContext.getTaskKey(), sheetContext.getName(), rst, sheetContext.getWrapper().getAction(),
                sheetContext.getWrapper().getXId(), sheetContext.getWrapper().getXUUID(), sheetContext.getSheetNo(),
                sheetContext.getSheet().getSheetName(), sheetContext.getDashboardId(), sheetContext.getWidgetId(),
                watch.elapsed(TimeUnit.MILLISECONDS) };
        if (sheetContext.getCustomLogger() != null) {
            sheetContext.getCustomLogger().info(
                    "Task({}) sheet worker({}) complete status={}, action={}, xid={}, xUUID={}, sheetNo={}, sheetName={}, dashboardId={}, widgetId={}, cost={}ms",
                    args);
        }

        return (T) rst;
    }
}
