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

import com.google.common.util.concurrent.ThreadFactoryBuilder;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.*;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/29 20:14
 * To change this template use File | Settings | File Templates.
 */
@Slf4j
public class ExecutorUtil {

    public static final ExecutorService WORKBOOK_WORKERS = Executors.newFixedThreadPool(4,
            new ThreadFactoryBuilder().setNameFormat("workbook-worker-%d").setDaemon(true).build());

    public static final ExecutorService SHEET_WORKERS = Executors.newFixedThreadPool(16,
            new ThreadFactoryBuilder().setNameFormat("sheet-worker-%d").setDaemon(true).build());


    public static <T> Future<T> submitWorkbookTask(WorkbookWorker worker) {
        printThreadPoolStatusLog(WORKBOOK_WORKERS, "WORKBOOK_WORKERS");
        return ExecutorUtil.WORKBOOK_WORKERS.submit(worker);
    }

    public static <T> Future<T> submitWorkbookTask(WorkBookContext context) {
        return ExecutorUtil.submitWorkbookTask(new WorkbookWorker(context));
    }

    public static <T> Future<T> submitSheetTask(SheetWorker worker) {
        printThreadPoolStatusLog(SHEET_WORKERS, "SHEET_WORKERS");
        return ExecutorUtil.SHEET_WORKERS.submit(worker);
    }

    public static <T> Future<T> submitSheetTask(SheetContext context) {
        return ExecutorUtil.submitSheetTask(new SheetWorker(context));
    }


    public static void printThreadPoolStatusLog(ExecutorService executorService, String serviceName) {
        ThreadPoolExecutor executor = (ThreadPoolExecutor) executorService;
        log.info("{} keep alive time: {}, poolSize：{}, waiting queue size: {}, task count: {}, completed task size: {}",
                serviceName,
                executor.getKeepAliveTime(TimeUnit.SECONDS),
                executor.getPoolSize(),
                executor.getQueue().size(),
                executor.getTaskCount(),
                executor.getCompletedTaskCount()
        );

    }
}
