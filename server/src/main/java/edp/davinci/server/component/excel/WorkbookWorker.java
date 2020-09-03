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

import java.io.FileOutputStream;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import com.google.common.base.Stopwatch;
import com.google.common.collect.Lists;

import edp.davinci.commons.util.StringUtils;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.server.config.SpringContextHolder;
import edp.davinci.server.dto.cronjob.MsgMailExcel;
import edp.davinci.server.dto.view.WidgetQueryParam;
import edp.davinci.server.enums.ActionEnum;
import edp.davinci.server.enums.FileTypeEnum;
import edp.davinci.server.model.ExcelHeader;
import edp.davinci.server.util.ExcelUtils;
import edp.davinci.server.util.FileUtils;
import edp.davinci.server.util.ScriptUtils;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/29 19:29
 * To change this template use File | Settings | File Templates.
 */
public class WorkbookWorker<T> extends MsgNotifier implements Callable {

    private WorkBookContext workBookContext;

    public WorkbookWorker(WorkBookContext workBookContext) {
        this.workBookContext = workBookContext;
    }

    @Override
    public T call() throws Exception {

        Stopwatch watch = Stopwatch.createStarted();

        MsgWrapper wrapper = workBookContext.getWrapper();
        Object[] logArgs = {workBookContext.getTaskKey(), wrapper.getAction(), wrapper.getXId()};
        Logger logger = workBookContext.getCustomLogger();
        boolean log  = logger != null;
        if (log) {
            logger.info("Task({}) workbook worker start action={}, xid={}", logArgs);
        }

        Workbook wb = null;
        String filePath = null;
        try {
            List<SheetContext> sheetContextList = buildSheetContextList();
            if (CollectionUtils.isEmpty(sheetContextList)) {
				throw new IllegalArgumentException(
						"Task(" + workBookContext.getTaskKey() + ") workbook worker sheetContextList is empty");
            }
            wb = new SXSSFWorkbook(1000);
            List<Future> futures = Lists.newArrayList();
            int sheetNo = 0;
            for (SheetContext sheetContext : sheetContextList) {
                sheetNo++;
                String name = sheetNo + "-" + sheetContext.getName();
                Sheet sheet = wb.createSheet(name);
                sheetContext.setSheet(sheet);
                sheetContext.setWorkbook(wb);
                sheetContext.setSheetNo(sheetNo);
                Future<Boolean> future = ExecutorUtil.submitSheetTask(sheetContext, workBookContext.getCustomLogger());
                futures.add(future);
            }

            Boolean rst = true;
            try {
                for (Future<Boolean> future : futures) {
                    if (!future.get(1, TimeUnit.HOURS)) {
                        rst = false;
                        break;
                    }
                }
            } catch (InterruptedException | ExecutionException | TimeoutException e) {

                rst = false;

                if (log) {
                    logger.error("Task({}) workbook worker error", workBookContext.getTaskKey());
                    logger.error(e.toString(), e);
                }

                MsgMailExcel msg = (MsgMailExcel) wrapper.getMsg();
                msg.setException(e);
            }

            if (rst) {
                filePath = ((FileUtils) SpringContextHolder.getBean(FileUtils.class)).getFilePath(FileTypeEnum.XLSX, this.workBookContext.getWrapper());
                try (FileOutputStream out = new FileOutputStream(filePath);) {
                    wb.write(out);
                    out.flush();
                } catch (Exception e) {
                    workbookDispose(wb);
                    throw e;
                }
                wrapper.setRst(filePath);
            } else {
                if (log) {
                    logger.info("Task({}) workbook worker fail, xid={}, xUUID={}", workBookContext.getTaskKey(), wrapper.getXId(), wrapper.getXUUID());
                }

                for (Future future : futures) {
                    future.cancel(true);
                }

                wrapper.setRst(null);
            }

            super.tell(wrapper);

        } catch (Exception e) {
            if (log) {
            	logger.error("Task({}) workbook worker error", workBookContext.getTaskKey(), e.getMessage());
                logger.error(e.toString(), e);
            }

            MsgMailExcel msg = (MsgMailExcel) wrapper.getMsg();
            msg.setException(e);
            super.tell(wrapper);

            if (StringUtils.isNotEmpty(filePath)) {
                FileUtils.delete(filePath);
            }

        } finally {
            workbookDispose(wb);
        }

        Object[] args = { workBookContext.getTaskKey(), StringUtils.isNotEmpty(filePath), wrapper.getAction(), wrapper.getXId(),
				wrapper.getXUUID(), filePath, watch.elapsed(TimeUnit.MILLISECONDS) };

        if (log) {
			logger.info(
					"Task({}) workbook worker complete status={}, action={}, xid={}, xUUID={}, filePath={}, cost={}ms",
					args);
		}

        return (T) filePath;
    }

    private void workbookDispose(Workbook wb) {
        if (wb != null) {
            ((SXSSFWorkbook)wb).dispose();
        }
    }

    private List<SheetContext> buildSheetContextList() throws Exception {
        List<SheetContext> sheetContextList = Lists.newArrayList();
        for (WidgetContext widgetContext : workBookContext.getWidgets()) {
            WidgetQueryParam queryParam = null;
            if (widgetContext.isHasQueryParam() && null != widgetContext.getQueryParam()) {
                queryParam = widgetContext.getQueryParam();
            } else {
                queryParam = ScriptUtils.getWidgetQueryParam(
                        widgetContext.getDashboard() != null ? widgetContext.getDashboard().getConfig() : null,
                        widgetContext.getWidget().getConfig(),
                        widgetContext.getMemDashboardWidget() != null ? widgetContext.getMemDashboardWidget().getId()
                                : null);
            }

            // data for excel do not use cache
            queryParam.setCache(false);

            boolean isTable;
            List<ExcelHeader> excelHeaders = null;
            if (isTable = ExcelUtils.isTable(widgetContext.getWidget().getConfig())) {
                excelHeaders = ScriptUtils.getExcelHeader(widgetContext.getWidget().getConfig(), queryParam.getParams());
            }

            SheetContext sheetContext = SheetContext.builder()
                    .contain(Boolean.FALSE)
                    .isTable(isTable)
                    .excelHeaders(excelHeaders)
                    .dashboardId(null != widgetContext.getDashboard() ? widgetContext.getDashboard().getId() : null)
                    .widgetId(widgetContext.getWidget().getId())
                    .name(widgetContext.getWidget().getName())
                    .wrapper(workBookContext.getWrapper())
                    .taskKey(workBookContext.getTaskKey())
                    .customLogger(workBookContext.getCustomLogger())
                    .viewId(widgetContext.getWidget().getViewId())
                    .user(workBookContext.getUser())
                    .queryParam(queryParam)
                    .build();
            
            sheetContextList.add(sheetContext);
        }
        
        return sheetContextList;
    }
}