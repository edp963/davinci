package edp.davinci.service.excel;

import com.google.common.util.concurrent.ThreadFactoryBuilder;

import java.util.concurrent.*;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/29 20:14
 * To change this template use File | Settings | File Templates.
 */
public class ExecutorUtil {

   public static final ExecutorService WORKBOOK_WORKERS=Executors.newFixedThreadPool(4,
           new ThreadFactoryBuilder().setNameFormat("workbook-worker-%d").setDaemon(true).build());

    public static final ExecutorService SHEET_WORKERS=Executors.newFixedThreadPool(16,
            new ThreadFactoryBuilder().setNameFormat("sheet-worker-%d").setDaemon(true).build());



    public static <T> Future<T> submitWorkbookTask(WorkbookWorker worker){
        return ExecutorUtil.WORKBOOK_WORKERS.submit(worker);
    }

    public static <T> Future<T> submitWorkbookTask(WorkBookContext context){
        return ExecutorUtil.submitWorkbookTask(new WorkbookWorker(context));
    }

    public static <T> Future<T> submitSheetTask(SheetWorker worker){
        return ExecutorUtil.SHEET_WORKERS.submit(worker);
    }

    public static <T> Future<T> submitSheetTask(SheetContext context){
        return ExecutorUtil.submitSheetTask(new SheetWorker(context));
    }
}
