package edp.davinci.rest.cronjob;

import java.io.File;
import java.util.concurrent.Callable;

public class TaskThread implements Callable<String> {
    String filePath;
    volatile boolean exit = false;

    TaskThread(String filePath) {
        this.filePath = filePath;
    }

    @Override
    public String call() throws InterruptedException {

        while (!exit && !(new File(filePath).exists())) {

            Thread.sleep(1000);
        }
        return "1";
    }


}
