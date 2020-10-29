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

package edp.davinci.service.screenshot;

import com.alibaba.druid.util.StringUtils;
import edp.core.consts.Consts;
import edp.core.utils.DateUtils;
import edp.core.utils.FileUtils;
import edp.davinci.core.enums.LogNameEnum;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.*;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.phantomjs.PhantomJSDriver;
import org.openqa.selenium.phantomjs.PhantomJSDriverService;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static edp.davinci.service.screenshot.BrowserEnum.valueOf;

@Slf4j
@Component
public class ScreenshotUtil {
	
	private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

    @Value("${screenshot.default_browser:PHANTOMJS}")
    private String DEFAULT_BROWSER;

    @Value("${screenshot.chromedriver_path:}")
    private String CHROME_DRIVER_PATH;

    @Value("${screenshot.phantomjs_path:}")
    private String PHANTOMJS_PATH;

    @Value("${screenshot.remote_webdriver_url:}")
    private String REMOTE_WEBDRIVER_URL;

    @Value("${screenshot.timeout_second:600}")
    private int timeOutSecond;

    private static final int DEFAULT_SCREENSHOT_WIDTH = 1920;
    private static final int DEFAULT_SCREENSHOT_HEIGHT = 1080;

    private static final ExecutorService executorService = Executors.newFixedThreadPool(8);

    @Autowired
    private FileUtils fileUtils;

    public void screenshot(long jobId, List<ImageContent> imageContents, Integer imageWidth) {
    	scheduleLogger.info("Start screenshot for job({})", jobId);
        try {
        	int contentsSize = imageContents.size();
            List<Future> futures = new ArrayList<>(contentsSize);
            final AtomicInteger index = new AtomicInteger(1);
            imageContents.forEach(content -> futures.add(executorService.submit(() -> {
            	scheduleLogger.info("Cronjob({}) thread({}) for screenshot start, type:{}, id:{}, total:{}", jobId, index.get(), content.getDesc(), content.getCId(), contentsSize);
                try {
                    File image = doScreenshot(jobId, content.getUrl(), imageWidth);
                    content.setContent(image);
                } catch (Exception e) {
                	scheduleLogger.error("Cronjob({}) thread({}) screenshot error", jobId, index.get());
                	scheduleLogger.error(e.getMessage(), e);
                } finally {
                    scheduleLogger.info("Cronjob({}) thread({}) for screenshot finish, type:{}, id:{}, total:{}", jobId, index.get(), content.getDesc(), content.getCId(), contentsSize);
                    index.incrementAndGet();
                }
            })));

            try {
                for (Future future : futures) {
                    future.get();
                }
            } catch (ExecutionException e) {
            	scheduleLogger.error(e.getMessage(), e);
            }

            imageContents.sort(Comparator.comparing(ImageContent::getOrder));

        } catch (InterruptedException e) {
        	scheduleLogger.error(e.getMessage(), e);
        } finally {
        	scheduleLogger.info("Cronjob({}) finish screenshot", jobId);
        }
    }

    private File doScreenshot(long jobId, String url, Integer imageWidth) throws Exception {
        WebDriver driver = generateWebDriver(jobId, imageWidth);

        driver.get(url);
        scheduleLogger.info("Cronjob({}) do screenshot url={}, timeout={} start", jobId, url, timeOutSecond);
        try {
            WebDriverWait wait = new WebDriverWait(driver, timeOutSecond);
            ExpectedCondition<WebElement> ConditionOfSign = ExpectedConditions.presenceOfElementLocated(By.id("headlessBrowserRenderSign"));
            ExpectedCondition<WebElement> ConditionOfWidth = ExpectedConditions.presenceOfElementLocated(By.id("width"));
            ExpectedCondition<WebElement> ConditionOfHeight = ExpectedConditions.presenceOfElementLocated(By.id("height"));

            wait.until(ExpectedConditions.or(ConditionOfSign, ConditionOfWidth, ConditionOfHeight));

            String widthVal = driver.findElement(By.id("width")).getAttribute("value");
            String heightVal = driver.findElement(By.id("height")).getAttribute("value");

            int width = imageWidth != null && imageWidth > 0 ? imageWidth : DEFAULT_SCREENSHOT_WIDTH;
            int height = DEFAULT_SCREENSHOT_HEIGHT;

            if (!StringUtils.isEmpty(widthVal)) {
                width = Integer.parseInt(widthVal);
            }

            if (!StringUtils.isEmpty(heightVal)) {
                height = Integer.parseInt(heightVal);
            }

            driver.manage().window().setSize(new Dimension(width, height));
            Thread.sleep(2000);
            File tempImage = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            File tempDir = new File(fileUtils.fileBasePath + Consts.DIR_TEMP + DateUtils.getNowDateYYYYMMDD());
            if (!tempDir.exists()) {
                tempDir.mkdirs();
            }
            File image = new File(tempDir.getPath() + File.separator + tempImage.getName());
            if (FileUtils.copy(tempImage, image) > -1) {
                tempImage.delete();
                return image;
            }

        } catch (TimeoutException te) {
            String text = driver.findElements(By.tagName("html")).get(0).getAttribute("innerText");
            scheduleLogger.info("Cronjob({}) do screenshot url={} text=\n{}", text);
            LogEntries logEntries = driver.manage().logs().get(LogType.BROWSER);
            for (LogEntry entry : logEntries) {
                scheduleLogger.info(entry.getLevel() + " " + entry.getMessage());
            }
            scheduleLogger.error(te.getMessage(), te);
        } catch (InterruptedException e) {
            LogEntries logEntries= driver.manage().logs().get(LogType.BROWSER);
            for (LogEntry entry : logEntries) {
                scheduleLogger.info(entry.getLevel() + " " + entry.getMessage());
            }
        	scheduleLogger.error(e.getMessage(), e);
        } finally {
        	scheduleLogger.info("Cronjob({}) do screenshot url={} finish", jobId, url);
            driver.quit();
        }

        return null;
    }

    private WebDriver generateWebDriver(Long jobId, Integer imageWidth) throws ExecutionException {
        WebDriver driver;
        BrowserEnum browserEnum = valueOf(DEFAULT_BROWSER);
        switch (browserEnum) {
            case CHROME:
                driver = generateChromeDriver();
                scheduleLogger.info("Cronjob({}) generating chrome driver({})...", jobId, driver.getClass().toString());
                break;
            case PHANTOMJS:
                driver = generatePhantomJsDriver();
                scheduleLogger.info("Cronjob({}) generating PhantomJs driver({})...", jobId, PHANTOMJS_PATH);
                break;
            default:
                throw new IllegalArgumentException("Unknown Web browser:" + DEFAULT_BROWSER);
        }

        driver.manage().timeouts().implicitlyWait(3, TimeUnit.MINUTES);
        driver.manage().window().maximize();
        driver.manage().window().setSize(new Dimension(imageWidth != null && imageWidth > 0 ? imageWidth : DEFAULT_SCREENSHOT_WIDTH, DEFAULT_SCREENSHOT_HEIGHT));
        
        return driver;
    }


    private WebDriver generateChromeDriver() throws ExecutionException {
        if (!StringUtils.isEmpty(REMOTE_WEBDRIVER_URL)) {
            scheduleLogger.info("user RemoteWebDriver ({})", REMOTE_WEBDRIVER_URL);
            try {
                return new RemoteWebDriver(new URL(REMOTE_WEBDRIVER_URL), DesiredCapabilities.chrome());
            } catch (MalformedURLException ex) {
                scheduleLogger.error(ex.toString(), ex);
            }
        }
        File file = new File(CHROME_DRIVER_PATH);
        if (!file.canExecute()) {
            if (!file.setExecutable(true)) {
                throw new ExecutionException(new Exception(CHROME_DRIVER_PATH + " is not executable!"));
            }
        }

        System.setProperty(ChromeDriverService.CHROME_DRIVER_EXE_PROPERTY, CHROME_DRIVER_PATH);
        ChromeOptions options = new ChromeOptions();

        options.addArguments("headless");
        options.addArguments("no-sandbox");
        options.addArguments("disable-gpu");
        options.addArguments("disable-gpu");
        options.addArguments("disable-features=NetworkService");
        options.addArguments("ignore-certificate-errors");
        options.addArguments("silent");
        options.addArguments("disable-application-cache");
        options.addArguments("disable-web-security");
        options.addArguments("no-proxy-server");

        return new ChromeDriver(options);
    }

    private WebDriver generatePhantomJsDriver() throws ExecutionException {
        File file = new File(PHANTOMJS_PATH);
        if (!file.canExecute()) {
            if (!file.setExecutable(true)) {
                throw new ExecutionException(new Exception(PHANTOMJS_PATH + " is not executable!"));
            }
        }
        System.setProperty(PhantomJSDriverService.PHANTOMJS_EXECUTABLE_PATH_PROPERTY, PHANTOMJS_PATH);
        return new PhantomJSDriver();
    }
}
