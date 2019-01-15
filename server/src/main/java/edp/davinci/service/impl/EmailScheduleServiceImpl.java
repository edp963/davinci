/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.common.job.ScheduleService;
import edp.core.exception.ServerException;
import edp.core.utils.DateUtils;
import edp.core.utils.FileUtils;
import edp.core.utils.MailUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.enums.CronJobMediaType;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.cronJobDto.CronJobConfig;
import edp.davinci.dto.cronJobDto.CronJobContent;
import edp.davinci.model.*;
import edp.davinci.service.ViewService;
import edp.davinci.service.WidgetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.net.URLDecoder;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@SuppressWarnings("AlibabaThreadPoolCreation")
@Slf4j
@Service("emailScheduleService")
public class EmailScheduleServiceImpl extends CommonService implements ScheduleService {

    @Autowired
    private CronJobMapper cronJobMapper;

    @Autowired
    private MailUtils mailUtils;

    @Value("${file.phantomJs-path}")
    private String phantomJsFile;

    @Value("${phantomjs_home}")
    private String phantomJsHome;

    @Value("${file.userfiles-path}")
    private String fileBasePath;

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Autowired
    private DisplayMapper displayMapper;

    @Autowired
    private ViewService viewService;

    @Autowired
    private WidgetService widgetService;


    private volatile boolean imageExit = false;

    private static final String portal = "PORTAL";

    /**
     * outlook最大图片显示高度为1728px
     */
    private final int imageMaxHeight = 1720;

    private final String baseUrl = File.separator + "tempFiles" + File.separator + DateUtils.getNowDateYYYYMM();

    @Override
    public void execute(long jobId) throws Exception {
        CronJob cronJob = cronJobMapper.getById(jobId);
        if (null != cronJob && !StringUtils.isEmpty(cronJob.getConfig())) {
            CronJobConfig cronJobConfig = JSONObject.parseObject(cronJob.getConfig(), CronJobConfig.class);
            if (null != cronJobConfig && !StringUtils.isEmpty(cronJobConfig.getType())) {
                Map<String, Object> content = new HashMap<>();
                User user = userMapper.selectByEmail(cronJobConfig.getTo());
                String username = cronJobConfig.getTo().split("@")[0];
                if (null != user) {
                    username = StringUtils.isEmpty(user.getName()) ? user.getUsername() : user.getName();
                }
                content.put("username", username);

                List<File> attachments = null;
                if (cronJobConfig.getType().equals(CronJobMediaType.IMAGE.getType())) {
                    attachments = generateImages(cronJobConfig, cronJob.getCreateBy());
                } else if (cronJobConfig.getType().equals(CronJobMediaType.EXCEL.getType())) {
                    attachments = generateExcels(cronJobConfig, user);
                } else if (cronJobConfig.getType().equals(CronJobMediaType.IMAGEANDEXCEL.getType())) {
                    attachments = new ArrayList<>();
                    attachments.addAll(generateImages(cronJobConfig, cronJob.getCreateBy()));
                    attachments.addAll(generateExcels(cronJobConfig, user));
                }

                String[] cc = null, bcc = null;
                if (!StringUtils.isEmpty(cronJobConfig.getCc())) {
                    cc = cronJobConfig.getCc().split(";");
                }

                if (!StringUtils.isEmpty(cronJobConfig.getBcc())) {
                    bcc = cronJobConfig.getBcc().split(";");
                }

                mailUtils.sendTemplateAttachmentsEmail(
                        cronJobConfig.getSubject(),
                        cronJobConfig.getTo(),
                        cc,
                        bcc,
                        Constants.SCHEDULE_MAIL_TEMPLATE,
                        content,
                        attachments);
            }
        }
    }


    /**
     * 根据job配置截取图片
     *
     * @param cronJobConfig
     * @param userId
     * @return
     * @throws Exception
     */
    private List<File> generateImages(CronJobConfig cronJobConfig, Long userId) throws Exception {
        List<File> files = new ArrayList<>();
        for (CronJobContent cronJobContent : cronJobConfig.getContentList()) {
            String imageName = UUID.randomUUID() + ".png";
            String imageUrl = baseUrl + File.separator + imageName;
            String imagePath = fileBasePath + imageUrl;
            File file = new File(fileBasePath + baseUrl);
            if (!file.exists()) {
                file.mkdirs();
            }

            imagePath = imagePath.replaceAll(File.separator + "{2,}", File.separator);

            String url = getContentUrl(userId, cronJobContent.getContentType(), cronJobContent.getId());
            boolean bol = phantomRender(url, imagePath);
            if (bol) {
                File image = new File(imagePath);
                files.add(image);
            }
        }
        return files;
    }

    /**
     * phantom打开连接并截图
     *
     * @param url
     * @param imgPath
     * @return
     * @throws Exception
     */
    private boolean phantomRender(String url, String imgPath) throws Exception {
        boolean result = false;
        if (!StringUtils.isEmpty(phantomJsHome) && !StringUtils.isEmpty(phantomJsFile)) {
            String rendJsPath = URLDecoder.decode(phantomJsFile, "UTF-8");
            String cmd = buildCmd(phantomJsHome, rendJsPath, url, imgPath);
            log.info("phantom command : {}", cmd);
            Process process = Runtime.getRuntime().exec(cmd);
            InputStreamReader isr = new InputStreamReader(process.getInputStream());
            LineNumberReader input = new LineNumberReader(isr);
            String line = input.readLine();
            while (null != line) {
                log.info(line);
                line = input.readLine();
            }
            log.info("Finished command: {}", cmd);
            process.destroy();
            result = checkFileExists(imgPath);
        }
        return result;
    }

    /**
     * 生成运行命令
     *
     * @param args
     * @return
     */
    private String buildCmd(String... args) {
        StringBuilder sb = new StringBuilder();
        for (String exp : args) {
            sb.append(exp).append(" ");
        }
        return sb.toString().trim();
    }

    /**
     * 检查文件
     *
     * @param filePath
     * @return
     */
    private boolean checkFileExists(String filePath) {
        boolean result = false;
        ExecutorService executorService = Executors.newFixedThreadPool(5);
        Future<Boolean> future = (Future<Boolean>) executorService.submit(() -> {
            while (!imageExit && !new File(filePath).exists()) {
                Thread.sleep(1000);
            }
            return true;
        });

        try {
            result = future.get(10 * 60 * 1000, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        } finally {
            executorService.shutdown();
        }
        return result;
    }


    /**
     * 根据job配置生成excel ，多个excel压缩至zip包
     *
     * @param cronJobConfig
     * @return
     * @throws Exception
     */
    private List<File> generateExcels(CronJobConfig cronJobConfig, User user) throws Exception {
        List<File> files = new ArrayList<>();
        for (CronJobContent cronJobContent : cronJobConfig.getContentList()) {
            if (CheckEntityEnum.DASHBOARD.getSource().equalsIgnoreCase(cronJobContent.getContentType().trim())
                    || portal.equalsIgnoreCase(cronJobContent.getContentType().trim())) {
                Dashboard dashboard = dashboardMapper.getById(cronJobContent.getId());
                if (dashboard != null) {
                    Set<Widget> widgets = widgetMapper.getByDashboard(dashboard.getId());
                    if (widgets != null && widgets.size() > 0) {
                        String filePath = fileBasePath + baseUrl + File.separator + dashboard.getName() + "-" + UUID.randomUUID() + FileTypeEnum.XLSX.getFormat();

                        filePath = filePath.replaceAll(File.separator + "{2,}", File.separator);

                        File file = widgetService.writeExcel(widgets, null, filePath, user, false);
                        files.add(file);
                    }
                }
            } else if (CheckEntityEnum.DISPLAY.getSource().equalsIgnoreCase(cronJobContent.getContentType().trim())) {
                Display display = displayMapper.getById(cronJobContent.getId());
                if (display != null) {
                    Set<Widget> widgets = widgetMapper.getByDisplayId(display.getId());
                    if (widgets != null && widgets.size() > 0) {
                        String filePath = fileBasePath + baseUrl + File.separator + display.getName() + "-" + UUID.randomUUID() + FileTypeEnum.XLSX.getFormat();
                        filePath = filePath.replaceAll(File.separator + "{2,}", File.separator);
                        File file = widgetService.writeExcel(widgets, null, filePath, user, false);
                        files.add(file);
                    }
                }
            }
        }

        //多个文件压缩至zip包
        if (null != files && files.size() > 1) {
            File zipFile = new File(fileBasePath + baseUrl + File.separator + UUID.randomUUID() + ".zip");
            FileUtils.zipFile(files, zipFile);
            files.clear();
            files.add(zipFile);
        }
        return files;
    }

}
