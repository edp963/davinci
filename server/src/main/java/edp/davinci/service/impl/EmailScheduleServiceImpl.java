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
import edp.core.common.quartz.ScheduleService;
import edp.core.enums.MailContentTypeEnum;
import edp.core.exception.ServerException;
import edp.core.model.MailAttachment;
import edp.core.model.MailContent;
import edp.core.utils.CollectionUtils;
import edp.core.utils.MailUtils;
import edp.core.utils.ServerUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.*;
import edp.davinci.dao.*;
import edp.davinci.dto.cronJobDto.CronJobConfig;
import edp.davinci.dto.cronJobDto.CronJobContent;
import edp.davinci.dto.cronJobDto.ExcelContent;
import edp.davinci.dto.cronJobDto.MsgMailExcel;
import edp.davinci.dto.dashboardDto.DashboardWithPortal;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.widgetDto.WidgetWithRelationDashboardId;
import edp.davinci.model.*;
import edp.davinci.service.ProjectService;
import edp.davinci.service.ShareService;
import edp.davinci.service.excel.ExecutorUtil;
import edp.davinci.service.excel.MsgWrapper;
import edp.davinci.service.excel.WidgetContext;
import edp.davinci.service.excel.WorkBookContext;
import edp.davinci.service.screenshot.ImageContent;
import edp.davinci.service.screenshot.ScreenshotUtil;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.script.ScriptEngine;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.EMPTY;
import static edp.davinci.common.utils.ScriptUtiils.getExecuptParamScriptEngine;
import static edp.davinci.common.utils.ScriptUtiils.getViewExecuteParam;

@Slf4j
@Service("emailScheduleService")
public class EmailScheduleServiceImpl implements ScheduleService {

    private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

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

    private static final String PORTAL = "PORTAL";

    @Override
    public void execute(long jobId) throws Exception {
        CronJob cronJob = cronJobMapper.getById(jobId);
        if (null == cronJob || StringUtils.isEmpty(cronJob.getConfig())) {
            scheduleLogger.info("CronJob (:{}) config ie empty!", jobId);
            return;
        }
        scheduleLogger.info("CronJob (:{}) is started! ----------------", jobId);
        CronJobConfig cronJobConfig = null;
        try {
            cronJobConfig = JSONObject.parseObject(cronJob.getConfig(), CronJobConfig.class);
        } catch (Exception e) {
            log.error("Cronjob (:{}), parse config ({}) error: {}", jobId, cronJob.getConfig(), e.getMessage());
            return;
        }

        if (null == cronJobConfig || StringUtils.isEmpty(cronJobConfig.getType())) {
            log.warn("cron job config is not expected format: {}", cronJob.getConfig());
            scheduleLogger.warn("cron job config is not expected format: {}", cronJob.getConfig());
            return;
        }

        List<ExcelContent> excels = null;
        List<ImageContent> images = null;

        User creater = userMapper.getById(cronJob.getCreateBy());

        if (cronJobConfig.getType().equals(CronJobMediaType.IMAGE.getType())) {
            images = generateImages(jobId, cronJobConfig, cronJob.getCreateBy());
        } else if (cronJobConfig.getType().equals(CronJobMediaType.EXCEL.getType())) {
            try {
                excels = generateExcels(jobId, cronJobConfig, creater);
            } catch (Exception e) {
                e.printStackTrace();
                scheduleLogger.error(e.getMessage());
            }
        } else if (cronJobConfig.getType().equals(CronJobMediaType.IMAGEANDEXCEL.getType())) {
            images = generateImages(jobId, cronJobConfig, cronJob.getCreateBy());
            excels = generateExcels(jobId, cronJobConfig, creater);
        }

        List<MailAttachment> attachmentList = new ArrayList<>();

        if (!CollectionUtils.isEmpty(excels)) {
            excels.forEach(excel -> attachmentList.add(new MailAttachment(excel.getName() + FileTypeEnum.XLSX.getFormat(), excel.getFile())));
        }
        if (!CollectionUtils.isEmpty(images)) {
            images.forEach(image -> {
                String contentId = CronJobMediaType.IMAGE.getType() + image.getOrder();
                attachmentList.add(new MailAttachment(contentId, image.getImageFile(), image.getUrl(), true));
            });
        }

        if (CollectionUtils.isEmpty(attachmentList)) {
            log.warn("CronJob (:{}) Email content is empty", jobId);
            scheduleLogger.warn("CronJob (:{}) Email content is empty", jobId);
            return;
        }

        MailContent mailContent = null;
        try {
            mailContent = MailContent.MailContentBuilder.builder()
                    .withSubject(cronJobConfig.getSubject())
                    .withTo(cronJobConfig.getTo())
                    .withCc(cronJobConfig.getCc())
                    .withBcc(cronJobConfig.getBcc())
                    .withMainContent(MailContentTypeEnum.HTML)
                    .withHtmlContent(cronJobConfig.getContent())
                    .withTemplate(Constants.SCHEDULE_MAIL_TEMPLATE)
                    .withAttachments(attachmentList)
                    .build();
        } catch (ServerException e) {
            log.error("EmailScheduleServiceImpl.execute, build MailContent error: {}", e.getMessage());
            scheduleLogger.error("EmailScheduleServiceImpl.execute, build MailContent error: {}", e.getMessage());
        }
        mailUtils.sendMail(mailContent, null);
        scheduleLogger.info("CronJob (:{}) is finish! --------------", jobId);
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
        scheduleLogger.info("CronJob (:{}) fetching images contents", jobId);

        List<ImageContent> imageContents = new ArrayList<>();
        Set<Long> dashboardIds = new HashSet<>();
        Set<Long> portalIds = new HashSet<>();
        List<CronJobContent> jobContentList = new ArrayList<>();

        for (CronJobContent cronJobContent : cronJobConfig.getContentList()) {
            if (cronJobContent.getContentType().equalsIgnoreCase("display")) {
                jobContentList.add(cronJobContent);
            } else {
                if (CollectionUtils.isEmpty(cronJobContent.getItems())) {
                    portalIds.add(cronJobContent.getId());
                } else {
                    dashboardIds.addAll(cronJobContent.getItems());
                }
            }
        }

        if (!CollectionUtils.isEmpty(portalIds)) {
            Set<Dashboard> dashboards = dashboardMapper.queryByPortals(portalIds);
            if (!CollectionUtils.isEmpty(dashboards)) {
                dashboardIds.addAll(dashboards.stream().map(Dashboard::getId).collect(Collectors.toList()));
            }
        }

        if (!CollectionUtils.isEmpty(dashboardIds)) {
            Set<Dashboard> dashboards = dashboardMapper.queryDashboardsByIds(dashboardIds);
            for (Dashboard dashboard : dashboards) {
                if (dashboard != null && dashboard.getType() == 1) {
                    jobContentList.add(new CronJobContent(("dashboard"), dashboard.getId()));
                }
            }
        }

        if (CollectionUtils.isEmpty(jobContentList)) {
            scheduleLogger.warn("CronJob (:{}):  share entity is empty", jobId);
            return null;
        }

        int order = 0;
        for (CronJobContent cronJobContent : jobContentList) {
            String url = getContentUrl(userId, cronJobContent.getContentType(), cronJobContent.getId());
            imageContents.add(new ImageContent(order, cronJobContent.getId(), cronJobContent.getContentType(), url));
            order++;
        }

        if (!CollectionUtils.isEmpty(imageContents)) {
            screenshotUtil.screenshot(jobId, imageContents, cronJobConfig.getImageWidth());
        }
        scheduleLogger.info("CronJob (:{}) fetched images contents, count: {}", jobId, imageContents.size());
        return imageContents;
    }

    private String getContentUrl(Long userId, String contentType, Long contengId) {
        String shareToken = shareService.generateShareToken(contengId, null, userId);
        StringBuilder sb = new StringBuilder();

        String type = "";
        if ("widget".equalsIgnoreCase(contentType)) {
            type = "widget";
        } else if (PORTAL.equalsIgnoreCase(contentType) || "dashboard".equalsIgnoreCase(contentType)) {
            type = "dashboard";
        } else {
            type = "";
        }

        sb.append(serverUtils.getLocalHost())
                .append("/share.html#/share/")
                .append(contentType.equalsIgnoreCase("widget") || contentType.equalsIgnoreCase(PORTAL) ? "dashboard" : contentType)
                .append("?shareInfo=")
                .append(shareToken);

        if (!StringUtils.isEmpty(type)) {
            sb.append("&type=").append(type);
        }

        return sb.toString();
    }


    /**
     * 根据job配置生成excel ，多个excel压缩至zip包
     *
     * @param cronJobId
     * @param cronJobConfig
     * @return
     * @throws Exception
     */
    private List<ExcelContent> generateExcels(Long cronJobId, CronJobConfig cronJobConfig, User user) throws Exception {
        scheduleLogger.info("CronJob (:{}) fetching excel contents", cronJobId);

        ScriptEngine engine = getExecuptParamScriptEngine();

        Map<String, WorkBookContext> workBookContextMap = new HashMap<>();

        Set<Long> portalIds = new HashSet<>();
        Set<Long> dashboardIds = new HashSet<>();

        for (CronJobContent cronJobContent : cronJobConfig.getContentList()) {
            if (CheckEntityEnum.DASHBOARD.getSource().equalsIgnoreCase(cronJobContent.getContentType().trim())
                    || PORTAL.equalsIgnoreCase(cronJobContent.getContentType().trim())) {
                //兼容原始结构：contentId 为 dashboardId
                if (CollectionUtils.isEmpty(cronJobContent.getItems())) {
                    portalIds.add(cronJobContent.getId());
                } else {
                    dashboardIds.addAll(cronJobContent.getItems());
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

                        WorkBookContext workBookContext = WorkBookContext.WorkBookContextBuilder.newBuildder()
                                .withWidgets(widgetContexts)
                                .withUser(user)
                                .withResultLimit(resultLimit)
                                .withTaskKey("Schedule_" + cronJobId)
                                .withCustomLogger(scheduleLogger)
                                .build();

                        workBookContextMap.put(display.getName(), workBookContext);
                    }
                }
            }
        }

        if (!CollectionUtils.isEmpty(portalIds)) {
            Set<Dashboard> dashboards = dashboardMapper.queryByPortals(portalIds);
            if (!CollectionUtils.isEmpty(dashboards)) {
                dashboardIds.addAll(dashboards.stream().map(Dashboard::getId).collect(Collectors.toList()));
            }
        }

        List<Long> mailContentDashboardIds = null;
        if (!CollectionUtils.isEmpty(dashboardIds)) {
            mailContentDashboardIds = new ArrayList<>();
            Set<Dashboard> dashboards = dashboardMapper.queryDashboardsByIds(dashboardIds);
            for (Dashboard dashboard : dashboards) {
                mailContentDashboardIds.add(dashboard.getId());
            }
        }

        if (CollectionUtils.isEmpty(mailContentDashboardIds)) {
            scheduleLogger.warn("CronJob (:{}): dashboards is empty", cronJobId);
            return null;
        } else {
            scheduleLogger.info("CronJob (:{}): dashboards size: {}", cronJobId, mailContentDashboardIds.size());
        }

        for (Long dId : mailContentDashboardIds) {
            DashboardWithPortal dashboard = dashboardMapper.getDashboardWithPortalAndProject(dId);
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

                    WorkBookContext workBookContext = WorkBookContext.WorkBookContextBuilder.newBuildder()
                            .withWidgets(widgetContexts)
                            .withUser(user)
                            .withResultLimit(resultLimit)
                            .withTaskKey("Schedule_" + cronJobId)
                            .withCustomLogger(scheduleLogger)
                            .build();

                    workBookContextMap.put(dashboard.getName(), workBookContext);
                }
            }
        }

        if (CollectionUtils.isEmpty(workBookContextMap)) {
            scheduleLogger.warn("CronJob (:{}):  WorkbookContext is empty", cronJobId);
            return null;
        }

        List<ExcelContent> excelContents = new CopyOnWriteArrayList<>();
        Map<String, Future<String>> excelPathFutureMap = new LinkedHashMap<>();
        workBookContextMap.forEach((name, context) -> {
            scheduleLogger.info("CronJob (:{}): submit Workbook task: {}", cronJobId, name);
            String uuid = UUID.randomUUID().toString().replace("-", EMPTY);
            context.setWrapper(new MsgWrapper(new MsgMailExcel(cronJobId), ActionEnum.MAIL, uuid));
            excelPathFutureMap.put(name, ExecutorUtil.submitWorkbookTask(context, scheduleLogger));
        });

        excelPathFutureMap.forEach((name, future) -> {
            String excelPath = null;
            try {
                excelPath = future.get(1, TimeUnit.HOURS);
            } catch (Exception e) {
                log.warn(e.getMessage());
            }
            if (!StringUtils.isEmpty(excelPath)) {
                excelContents.add(new ExcelContent(name, excelPath));
            }
        });
        scheduleLogger.info("CronJob (:{}) fetched excel contents, count {}", cronJobId, excelContents.size());

        return excelContents.isEmpty() ? null : excelContents;
    }

}
