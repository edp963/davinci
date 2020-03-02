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
import edp.core.exception.ServerException;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.*;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.phantomjs.PhantomJSDriver;
import org.openqa.selenium.phantomjs.PhantomJSDriverService;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.*;

import static edp.davinci.service.screenshot.BrowserEnum.valueOf;

@Slf4j
@Component
public class ScreenshotUtil {

    @Value("${screenshot.default_browser:PHANTOMJS}")
    private String DEFAULT_BROWSER;

    @Value("${screenshot.chromedriver_path:}")
    private String CHROME_DRIVER_PATH;

    @Value("${screenshot.phantomjs_path:}")
    private String PHANTOMJS_PATH;

    @Value("${screenshot.timeout_second:600}")
    private int timeOutSecond;


    private static final int DEFAULT_SCREENSHOT_WIDTH = 1920;
    private static final int DEFAULT_SCREENSHOT_HEIGHT = 1080;

    private static final ExecutorService executorService = Executors.newFixedThreadPool(8);


    public void screenshot(long jobId, List<ImageContent> imageContents, Integer imageWidth) {
        log.info("start screenshot for job: {}", jobId);
        try {
            CountDownLatch countDownLatch = new CountDownLatch(imageContents.size());
            List<Future> futures = new ArrayList<>(imageContents.size());
            imageContents.forEach(content -> futures.add(executorService.submit(() -> {
                log.info("thread for screenshot start, type: {}, id: {}", content.getDesc(), content.getCId());
                try {
                    File image = doScreenshot(content.getUrl(), imageWidth);
                    content.setContent(image);
                } catch (Exception e) {
                    log.error("error ScreenshotUtil.screenshot, ", e);
                    e.printStackTrace();
                } finally {
                    countDownLatch.countDown();
                    log.info("thread for screenshot finish, type: {}, id: {}", content.getDesc(), content.getCId());
                }
            })));

            try {
                for (Future future : futures) {
                    future.get();
                }
                countDownLatch.await();
            } catch (ExecutionException e) {
            }

            imageContents.sort(Comparator.comparing(ImageContent::getOrder));

        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            log.info("finish screenshot for job: {}", jobId);
        }
    }


    private File doScreenshot(String url, Integer imageWidth) throws Exception {
        WebDriver driver = generateWebDriver(imageWidth);
        driver.get(url);
        log.info("getting... {}", url);
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
            return ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        } catch (TimeoutException te) {
            throw new ServerException("Screenshot TIMEOUT: get data time more than: " + timeOutSecond + " ms");
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            log.info("finish get {}, webdriver will quit soon", url);
            driver.quit();
        }
        return null;
    }

    private WebDriver generateWebDriver(Integer imageWidth) throws ExecutionException {
        WebDriver driver;
        BrowserEnum browserEnum = valueOf(DEFAULT_BROWSER);
        switch (browserEnum) {
            case CHROME:
                driver = generateChromeDriver();
                break;
            case PHANTOMJS:
                driver = generatePhantomJsDriver();
                break;
            default:
                throw new IllegalArgumentException("Unknown Web browser :" + DEFAULT_BROWSER);
        }

        driver.manage().timeouts().implicitlyWait(3, TimeUnit.MINUTES);
        driver.manage().window().maximize();
        driver.manage().window().setSize(new Dimension(imageWidth != null && imageWidth > 0 ? imageWidth : DEFAULT_SCREENSHOT_WIDTH, DEFAULT_SCREENSHOT_HEIGHT));
        
        return driver;
    }


    private WebDriver generateChromeDriver() throws ExecutionException {
        File file = new File(CHROME_DRIVER_PATH);
        if (!file.canExecute()) {
            if (!file.setExecutable(true)) {
                throw new ExecutionException(new Exception(CHROME_DRIVER_PATH + " is not executable!"));
            }
        }

        log.info("Generating Chrome driver ({})...", CHROME_DRIVER_PATH);
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
        log.info("Generating PhantomJs driver ({})...", PHANTOMJS_PATH);
        System.setProperty(PhantomJSDriverService.PHANTOMJS_EXECUTABLE_PATH_PROPERTY, PHANTOMJS_PATH);

        return new PhantomJSDriver();
    }
}
