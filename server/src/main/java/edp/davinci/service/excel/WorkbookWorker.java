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
import com.google.common.collect.Lists;
import edp.core.utils.CollectionUtils;
import edp.core.utils.FileUtils;
import edp.core.utils.SqlUtils;
import edp.davinci.common.utils.ScriptUtils;
import edp.davinci.core.config.SpringContextHolder;
import edp.davinci.core.enums.ActionEnum;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.core.model.ExcelHeader;
import edp.davinci.core.utils.ExcelUtils;
import edp.davinci.dao.ViewMapper;
import edp.davinci.dto.cronJobDto.MsgMailExcel;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.viewDto.ViewWithProjectAndSource;
import edp.davinci.service.ViewService;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.slf4j.Logger;

import java.io.FileOutputStream;
import java.util.List;
import java.util.concurrent.*;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/29 19:29
 * To change this template use File | Settings | File Templates.
 */
public class WorkbookWorker<T> extends MsgNotifier implements Callable {

    private WorkBookContext context;

    public WorkbookWorker(WorkBookContext context) {
        this.context = context;
    }

    @Override
    public T call() throws Exception {
        Stopwatch watch = Stopwatch.createStarted();
        Workbook wb = null;
        Logger logger = context.getCustomLogger();
        boolean log = context.getCustomLogger() != null;

        MsgWrapper wrapper = context.getWrapper();
        Object[] logArgs = {context.getTaskKey(), wrapper.getAction(), wrapper.getxId()};
        if (log) {
            logger.info("Task({}) workbook worker start action={}, xid={}", logArgs);
        }

        String filePath = null;
        try {

            List<SheetContext> sheetContextList = buildSheetContextList();
            if (CollectionUtils.isEmpty(sheetContextList)) {
                throw new IllegalArgumentException(
                        "Task(" + context.getTaskKey() + ") workbook worker sheetContextList is empty");
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
                Future<Boolean> future = ExecutorUtil.submitSheetTask(sheetContext, context.getCustomLogger());
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
                    logger.error("Task({}) workbook worker execute error", context.getTaskKey());
                    logger.error(e.toString(), e);
                }

                if (wrapper.getAction() == ActionEnum.MAIL) {
                    MsgMailExcel msg = (MsgMailExcel) wrapper.getMsg();
                    msg.setException(e);
                    super.tell(wrapper);
                    return null;
                }
            }

            if (rst) {
                filePath = ((FileUtils) SpringContextHolder.getBean(FileUtils.class)).getFilePath(FileTypeEnum.XLSX, this.context.getWrapper());
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
                    logger.info("Task({}) sheet worker execute fail action={}, xid={}", logArgs);
                }

                for (Future future : futures) {
                    future.cancel(true);
                }

                wrapper.setRst(null);
            }

            super.tell(wrapper);

        } catch (Exception e) {
            if (log) {
                logger.error("Task({}) workbook worker execute error", context.getTaskKey());
                logger.error(e.toString(), e);
            }
            
            if (wrapper.getAction() == ActionEnum.MAIL) {
                MsgMailExcel msg = (MsgMailExcel) wrapper.getMsg();
                msg.setException(e);
            }
            
            if (StringUtils.isNotEmpty(filePath)) {
                FileUtils.delete(filePath);
            }

            super.tell(wrapper);

        } finally {
            workbookDispose(wb);
        }

        if (wrapper.getAction() == ActionEnum.DOWNLOAD) {
            Object[] args = {context.getTaskKey(), StringUtils.isNotEmpty(filePath), wrapper.getAction(), wrapper.getxId(), filePath, watch.elapsed(TimeUnit.MILLISECONDS)};
            if (log) {
                logger.info("Task({}) workbook worker complete status={}, action={}, xid={}, filePath={}, cost={}ms", args);
            }
        }

        if (wrapper.getAction() == ActionEnum.SHAREDOWNLOAD || wrapper.getAction() == ActionEnum.MAIL) {
            Object[] args = {context.getTaskKey(), StringUtils.isNotEmpty(filePath), wrapper.getAction(), wrapper.getxUUID(), filePath, watch.elapsed(TimeUnit.MILLISECONDS)};
            if (log) {
                logger.info("Task({}) workbook worker complete status={}, action={}, xUUID={}, filePath={}, cost={}ms", args);
            }
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
        for (WidgetContext context : context.getWidgets()) {
            ViewExecuteParam executeParam = null;
            if (context.isHasExecuteParam() && null != context.getExecuteParam()) {
                executeParam = context.getExecuteParam();
            } else {
                executeParam = ScriptUtils.getViewExecuteParam(
                        context.getDashboard() != null ? context.getDashboard().getConfig() : null,
                        context.getWidget().getConfig(),
                        context.getMemDashboardWidget() != null ? context.getMemDashboardWidget().getId() : null);
            }

            ViewWithProjectAndSource viewWithProjectAndSource = ((ViewMapper) SpringContextHolder.getBean(ViewMapper.class)).getViewWithProjectAndSourceById(context.getWidget().getViewId());

            SQLContext sqlContext = ((ViewService) SpringContextHolder.getBean(ViewService.class)).getSQLContext(context.getIsMaintainer(), viewWithProjectAndSource, executeParam, this.context.getUser());

            if (sqlContext == null) {
                continue;
            }
            SqlUtils sqlUtils = ((SqlUtils) SpringContextHolder.getBean(SqlUtils.class)).init(viewWithProjectAndSource.getSource());

            boolean isTable;
            List<ExcelHeader> excelHeaders = null;
            if (isTable = ExcelUtils.isTable(context.getWidget().getConfig())) {
                excelHeaders = ScriptUtils.formatHeader(
                        context.getWidget().getConfig(), sqlContext.getViewExecuteParam().getParams());
            }
            SheetContext sheetContext = SheetContext.SheetContextBuilder.newBuilder()
                    .withExecuteSql(sqlContext.getExecuteSql())
                    .withQuerySql(sqlContext.getQuerySql())
                    .withExcludeColumns(sqlContext.getExcludeColumns())
                    .withContain(Boolean.FALSE)
                    .withSqlUtils(sqlUtils)
                    .withIsTable(isTable)
                    .withExcelHeaders(excelHeaders)
                    .withDashboardId(null != context.getDashboard() ? context.getDashboard().getId() : null)
                    .withWidgetId(context.getWidget().getId())
                    .withName(context.getMemDashboardWidget() == null || StringUtils.isEmpty(context.getMemDashboardWidget().getAlias())
                            ? context.getWidget().getName() : context.getMemDashboardWidget().getAlias())
                    .withWrapper(this.context.getWrapper())
                    .withResultLimit(this.context.getResultLimit())
                    .withTaskKey(this.context.getTaskKey())
                    .withCustomLogger(this.context.getCustomLogger())
                    .build();
            sheetContextList.add(sheetContext);
        }
        return sheetContextList;
    }
}
