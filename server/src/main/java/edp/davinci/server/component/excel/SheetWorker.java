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

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import com.google.common.base.Stopwatch;

import edp.davinci.server.config.SpringContextHolder;
import edp.davinci.server.dto.cronjob.MsgMailExcel;
import edp.davinci.server.enums.ActionEnum;
import edp.davinci.server.model.PagingWithQueryColumns;
import edp.davinci.server.service.ViewService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;

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
        boolean log = sheetContext.getCustomLogger() != null;
        Logger logger = sheetContext.getCustomLogger();
        final AtomicInteger count = new AtomicInteger(0);
        try {

            interrupted(sheetContext);

            PagingWithQueryColumns paging = ((ViewService) SpringContextHolder.getBean(ViewService.class))
                    .getDataWithQueryColumns(sheetContext.getViewId(), sheetContext.getQueryParam(),
                            sheetContext.getUser());
            if (log) {
                logger.info(
                        "Task({}) sheet worker({}), sheetNo:{}, sheetName:{} finish query, count:{}",
                        sheetContext.getTaskKey(), sheetContext.getName(), sheetContext.getSheetNo(),
                        sheetContext.getSheet().getSheetName(), count.get());
            }

            List<Map<String, Object>> resultList = paging.getResultList();
            sheetContext.setQueryColumns(paging.getColumns());
            super.init(sheetContext);
            super.writeHeader(sheetContext);
            resultList.forEach(row -> {
                interrupted(sheetContext);
                writeLine(sheetContext, row);
                count.incrementAndGet();
            });
            super.refreshHeightWidth(sheetContext);

        } catch (Exception e) {
            if (sheetContext.getWrapper().getAction() == ActionEnum.MAIL) {
                MsgMailExcel msg = (MsgMailExcel) sheetContext.getWrapper().getMsg();
                msg.setDate(new Date());
                msg.setException(e);
            }
            if (log) {
                logger.error(
                        "Task({}) sheet worker({}), sheetNo:{}, sheetName:{} error",
                        sheetContext.getTaskKey(), sheetContext.getName(), sheetContext.getSheetNo(),
                        sheetContext.getSheet().getSheetName(), e.getMessage());
            }
            rst = false;
        }

        Object[] args = { sheetContext.getTaskKey(), sheetContext.getName(), rst, sheetContext.getWrapper().getAction(),
                sheetContext.getWrapper().getXId(), sheetContext.getWrapper().getXUUID(), sheetContext.getSheetNo(),
                sheetContext.getSheet().getSheetName(), sheetContext.getDashboardId(), sheetContext.getWidgetId(),
                watch.elapsed(TimeUnit.MILLISECONDS) };
        if (log) {
            logger.info(
                    "Task({}) sheet worker({}) complete status={}, action={}, xid={}, xUUID={}, sheetNo={}, sheetName={}, dashboardId={}, widgetId={}, cost={}ms",
                    args);
        }

        return (T) rst;
    }

    private void interrupted(SheetContext sheetContext) {
        if (Thread.interrupted()) {
            Logger logger = sheetContext.getCustomLogger();
            boolean log = sheetContext.getCustomLogger() != null;
            if (log) {
                logger.error("Task({}) sheet worker({}), sheetNo:{}, sheetName:{} interrupted",
                        sheetContext.getTaskKey(), sheetContext.getName(), sheetContext.getSheetNo(), sheetContext.getSheet().getSheetName());
            }
            throw new RuntimeException("Task(" + sheetContext.getTaskKey() + ") sheet worker(" + sheetContext.getName() + "), " +
                    "sheetNo:" + sheetContext.getSheetNo() + ", sheetName:" + sheetContext.getSheet().getSheetName() + " interrupted");
        }
    }
}
