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

package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.common.job.ScheduleService;
import edp.core.utils.CollectionUtils;
import edp.core.utils.MailUtils;
import edp.core.utils.ServerUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.ActionEnum;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.enums.CronJobMediaType;
import edp.davinci.dao.*;
import edp.davinci.dto.cronJobDto.CronJobConfig;
import edp.davinci.dto.cronJobDto.CronJobContent;
import edp.davinci.dto.cronJobDto.ExcelContent;
import edp.davinci.dto.cronJobDto.MsgMailExcel;
import edp.davinci.dto.dashboardDto.DashboardWithPortal;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.widgetDto.WidgetWithRelationDashboardId;
import edp.davinci.model.CronJob;
import edp.davinci.model.Display;
import edp.davinci.model.User;
import edp.davinci.model.Widget;
import edp.davinci.service.ProjectService;
import edp.davinci.service.ShareService;
import edp.davinci.service.excel.ExecutorUtil;
import edp.davinci.service.excel.MsgWrapper;
import edp.davinci.service.excel.WidgetContext;
import edp.davinci.service.excel.WorkBookContext;
import edp.davinci.service.screenshot.ImageContent;
import edp.davinci.service.screenshot.ScreenshotUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.script.ScriptEngine;
import java.io.File;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

import static edp.core.consts.Consts.EMPTY;
import static edp.core.consts.Consts.SEMICOLON;
import static edp.davinci.common.utils.ScriptUtiils.getExecuptParamScriptEngine;
import static edp.davinci.common.utils.ScriptUtiils.getViewExecuteParam;

@Slf4j
@Service("emailScheduleService")
public class EmailScheduleServiceImpl implements ScheduleService {

    @Autowired
    private CronJobMapper cronJobMapper;

    @Autowired
    private MailUtils mailUtils;

    @Value("${file.userfiles-path}")
    private String fileBasePath;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Autowired
    private DisplayMapper displayMapper;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ShareService shareService;

    @Autowired
    private ServerUtils serverUtils;


    @Autowired
    private ScreenshotUtil screenshotUtil;


    @Value("${source.result-limit:1000000}")
    private int resultLimit;

    private static final String portal = "PORTAL";


    private final String baseUrl = File.separator + "tempFiles" + File.separator;

    private final static ExecutorService executorService = Executors.newFixedThreadPool(4);

    private final static ReentrantLock lock = new ReentrantLock();

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

                List<ExcelContent> excels = null;
                List<ImageContent> images = null;
                if (cronJobConfig.getType().equals(CronJobMediaType.IMAGE.getType())) {
                    images = generateImages(jobId, cronJobConfig, cronJob.getCreateBy());
                } else if (cronJobConfig.getType().equals(CronJobMediaType.EXCEL.getType())) {
                    excels = generateExcels(cronJobConfig, user);
                } else if (cronJobConfig.getType().equals(CronJobMediaType.IMAGEANDEXCEL.getType())) {
                    images = generateImages(jobId, cronJobConfig, cronJob.getCreateBy());
                    excels = new ArrayList<>();
                    excels.addAll(generateExcels(cronJobConfig, user));
                }

                String[] cc = null, bcc = null;
                if (!StringUtils.isEmpty(cronJobConfig.getCc())) {
                    cc = cronJobConfig.getCc().split(SEMICOLON);
                }

                if (!StringUtils.isEmpty(cronJobConfig.getBcc())) {
                    bcc = cronJobConfig.getBcc().split(SEMICOLON);
                }

                if (!CollectionUtils.isEmpty(excels) || !CollectionUtils.isEmpty(images)) {
                    mailUtils.sendTemplateAttachmentsEmail(
                            cronJobConfig.getSubject(),
                            cronJobConfig.getTo(),
                            cc,
                            bcc,
                            Constants.SCHEDULE_MAIL_TEMPLATE,
                            content,
                            excels,
                            images);
                }
            }
        }
    }


    /**
     * 根据job配置截取图片
     *
     * @param jobId
     * @param cronJobConfig
     * @param userId
     * @return
     * @throws Exception
     */
    private List<ImageContent> generateImages(long jobId, CronJobConfig cronJobConfig, Long userId) throws Exception {
        int order = 0;
        List<ImageContent> imageContents = new ArrayList<>();
        for (CronJobContent cronJobContent : cronJobConfig.getContentList()) {
            String url = getContentUrl(userId, cronJobContent.getContentType(), cronJobContent.getId());
            imageContents.add(new ImageContent(order, cronJobContent.getId(), cronJobContent.getContentType(), url));
            order++;
        }
        if (!CollectionUtils.isEmpty(imageContents)) {
            screenshotUtil.screenshot(jobId, imageContents);
        }
        return imageContents;
    }

    private String getContentUrl(Long userId, String contentType, Long contengId) {
        String shareToken = shareService.generateShareToken(contengId, null, userId);
        StringBuilder sb = new StringBuilder();

        String type = "";
        if ("widget".equalsIgnoreCase(contentType)) {
            type = "widget";
        } else if ("portal".equalsIgnoreCase(contentType) || "dashboard".equalsIgnoreCase(contentType)) {
            type = "dashboard";
        } else {
            type = "";
        }

        sb.append(serverUtils.getLocalHost())
                .append("/share.html#/share/")
                .append(contentType.equalsIgnoreCase("widget") || contentType.equalsIgnoreCase("portal") ? "dashboard" : contentType)
                .append("?shareInfo=")
                .append(shareToken);

        if (!StringUtils.isEmpty(type)) {
            sb.append("&type=" + type);
        }

        return sb.toString();
    }


    /**
     * 根据job配置生成excel ，多个excel压缩至zip包
     *
     * @param cronJobConfig
     * @return
     * @throws Exception
     */
    private List<ExcelContent> generateExcels(CronJobConfig cronJobConfig, User user) throws Exception {
        ScriptEngine engine = getExecuptParamScriptEngine();

        Map<String, WorkBookContext> workBookContextMap = new HashMap<>();

        for (CronJobContent cronJobContent : cronJobConfig.getContentList()) {
            if (CheckEntityEnum.DASHBOARD.getSource().equalsIgnoreCase(cronJobContent.getContentType().trim())
                    || portal.equalsIgnoreCase(cronJobContent.getContentType().trim())) {
                DashboardWithPortal dashboard = dashboardMapper.getDashboardWithPortalAndProject(cronJobContent.getId());
                if (dashboard != null) {

                    ProjectDetail projectDetail = projectService.getProjectDetail(dashboard.getProject().getId(), user, false);
                    boolean isMaintainer = projectService.isMaintainer(projectDetail, user);

                    Set<WidgetWithRelationDashboardId> set = widgetMapper.getByDashboard(dashboard.getId());
                    if (!CollectionUtils.isEmpty(set)) {
                        List<WidgetContext> widgetContexts = new ArrayList<>();
                        set.forEach(w -> {
                            Widget widget = new Widget();
                            BeanUtils.copyProperties(w, widget);
                            ViewExecuteParam viewExecuteParam = getViewExecuteParam(engine, dashboard.getConfig(), widget.getConfig(), w.getRelationId());
                            widgetContexts.add(new WidgetContext(widget, isMaintainer, viewExecuteParam));
                        });

                        workBookContextMap.put(dashboard.getName(), WorkBookContext.newWorkBookContext(widgetContexts, user, resultLimit));
                    }
                }
            } else if (CheckEntityEnum.DISPLAY.getSource().equalsIgnoreCase(cronJobContent.getContentType().trim())) {
                Display display = displayMapper.getById(cronJobContent.getId());
                if (display != null) {

                    ProjectDetail projectDetail = projectService.getProjectDetail(display.getProjectId(), user, false);
                    boolean isMaintainer = projectService.isMaintainer(projectDetail, user);

                    Set<Widget> widgets = widgetMapper.getByDisplayId(display.getId());
                    if (!CollectionUtils.isEmpty(widgets)) {
                        List<WidgetContext> widgetContexts = new ArrayList<>();
                        widgets.forEach(widget -> {
                            ViewExecuteParam viewExecuteParam = getViewExecuteParam(engine, null, widget.getConfig(), null);
                            widgetContexts.add(new WidgetContext(widget, isMaintainer, viewExecuteParam));
                        });

                        workBookContextMap.put(display.getName(), WorkBookContext.newWorkBookContext(widgetContexts, user, resultLimit));
                    }
                }
            }
        }

        if (CollectionUtils.isEmpty(workBookContextMap)) {
            return null;
        }

        CountDownLatch countDownLatch = new CountDownLatch(workBookContextMap.size());

        List<ExcelContent> excelContents = new CopyOnWriteArrayList<>();

        workBookContextMap.forEach((name, context) -> executorService.submit(() -> {
            try {
                lock.lock();
                String uuid = UUID.randomUUID().toString().replace("-", EMPTY);
                Condition condition = lock.newCondition();
                MsgMailExcel msgMailExcel = new MsgMailExcel(lock, condition);
                context.setWrapper(new MsgWrapper(msgMailExcel, ActionEnum.MAIL, uuid));
                ExecutorUtil.submitWorkbookTask(context);
                condition.await();
                excelContents.add(new ExcelContent(name, msgMailExcel.getFilePath()));
                countDownLatch.countDown();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.unlock();
            }
        }));

        countDownLatch.await();
        return excelContents.isEmpty() ? null : excelContents;
    }

}
