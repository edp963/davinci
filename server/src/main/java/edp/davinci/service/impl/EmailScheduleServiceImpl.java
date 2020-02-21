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
import edp.davinci.core.enums.ActionEnum;
import edp.davinci.core.enums.CronJobMediaType;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.cronJobDto.CronJobConfig;
import edp.davinci.dto.cronJobDto.CronJobContent;
import edp.davinci.dto.cronJobDto.ExcelContent;
import edp.davinci.dto.cronJobDto.MsgMailExcel;
import edp.davinci.dto.dashboardDto.DashboardTree;
import edp.davinci.dto.dashboardDto.DashboardWithPortal;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.widgetDto.WidgetWithRelationDashboardId;
import edp.davinci.dto.widgetDto.WidgetWithVizId;
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

import static edp.core.consts.Consts.AT_SYMBOL;
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

    @Autowired
    private DisplaySlideMapper displaySlideMapper;

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

    private static final String DISPLAY = "display";

    private static final String DASHBOARD = "dashboard";


    @Override
    public void execute(long jobId) throws Exception {
        CronJob cronJob = cronJobMapper.getById(jobId);
        if (null == cronJob || StringUtils.isEmpty(cronJob.getConfig())) {
            scheduleLogger.info("CronJob (:{}) config ie empty!", jobId);
            return;
        }
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
            images = generateImages(jobId, cronJobConfig, creater.getId());
        } else if (cronJobConfig.getType().equals(CronJobMediaType.EXCEL.getType())) {
            try {
                excels = generateExcels(jobId, cronJobConfig, creater);
            } catch (Exception e) {
                e.printStackTrace();
                scheduleLogger.error(e.getMessage());
            }
        } else if (cronJobConfig.getType().equals(CronJobMediaType.IMAGEANDEXCEL.getType())) {
            images = generateImages(jobId, cronJobConfig, creater.getId());
            excels = generateExcels(jobId, cronJobConfig, creater);
        }

        List<MailAttachment> attachmentList = new ArrayList<>();

        if (!CollectionUtils.isEmpty(excels)) {
            excels.forEach(excel -> attachmentList.add(new MailAttachment(excel.getName() + FileTypeEnum.XLSX.getFormat(), excel.getFile())));
        }
        if (!CollectionUtils.isEmpty(images)) {
            images.forEach(image -> {
                String contentId = CronJobMediaType.IMAGE.getType() +
                        Constants.UNDERLINE +
                        UUID.randomUUID().toString().replaceAll(Constants.MINUS, EMPTY);
                attachmentList.add(new MailAttachment(contentId, image.getImageFile(), image.getUrl(), true));
            });
        }

        if (CollectionUtils.isEmpty(attachmentList)) {
            log.warn("CronJob (:{}) Email content is empty", jobId);
            scheduleLogger.warn("CronJob (:{}) Email content is empty", jobId);
            return;
        }


        scheduleLogger.info("CronJob (:{}) is ready to send email", cronJob.getId());

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
    public List<ImageContent> generateImages(long jobId, CronJobConfig cronJobConfig, Long userId) throws Exception {
        scheduleLogger.info("CronJob (:{}) fetching images contents", jobId);

        List<ImageContent> imageContents = new ArrayList<>();

        Map<String, Integer> vizOrderMap = new HashMap<>();
        Map<Long, Map<Long, Integer>> displayPageMap = new HashMap<>();

        List<CronJobContent> jobContentList = getCronJobContents(cronJobConfig, vizOrderMap, displayPageMap);

        if (CollectionUtils.isEmpty(jobContentList)) {
            scheduleLogger.warn("CronJob (:{}):  share entity is empty", jobId);
            return null;
        }

        for (CronJobContent cronJobContent : jobContentList) {
            int order = 0;
            if (cronJobContent.getContentType().equalsIgnoreCase(DISPLAY)) {
                if (vizOrderMap.containsKey(DISPLAY + AT_SYMBOL + cronJobContent.getId())) {
                    order = vizOrderMap.get(DISPLAY + AT_SYMBOL + cronJobContent.getId());
                }

                if (!CollectionUtils.isEmpty(displayPageMap)) {
                    Map<Long, Integer> slidePageMap = displayPageMap.get(cronJobContent.getId());
                    if (CollectionUtils.isEmpty(cronJobContent.getItems())) {
                        int finalOrder = order;
                        slidePageMap.forEach((slide, page) -> {
                            String url = getContentUrl(userId, cronJobContent.getContentType(), cronJobContent.getId(), page);
                            imageContents.add(new ImageContent(finalOrder + page, cronJobContent.getId(), cronJobContent.getContentType(), url));
                        });
                    } else {
                        for (Long slideId : cronJobContent.getItems()) {
                            if (slidePageMap.containsKey(slideId)) {
                                int page = slidePageMap.get(slideId);
                                String url = getContentUrl(userId, cronJobContent.getContentType(), cronJobContent.getId(), page);
                                imageContents.add(new ImageContent(order + page, cronJobContent.getId(), cronJobContent.getContentType(), url));
                            }
                        }
                    }
                }
            } else {
                if (vizOrderMap.containsKey(DASHBOARD + AT_SYMBOL + cronJobContent.getId())) {
                    order = vizOrderMap.get(DASHBOARD + AT_SYMBOL + cronJobContent.getId());
                }
                String url = getContentUrl(userId, cronJobContent.getContentType(), cronJobContent.getId(), -1);
                imageContents.add(new ImageContent(order, cronJobContent.getId(), cronJobContent.getContentType(), url));
            }
        }

        if (!CollectionUtils.isEmpty(imageContents)) {
            screenshotUtil.screenshot(jobId, imageContents, cronJobConfig.getImageWidth());
        }
        scheduleLogger.info("CronJob (:{}) fetched images contents, count: {}", jobId, imageContents.size());
        return imageContents;
    }

    /**
     * 根据job配置生成excel
     *
     * @param jobId
     * @param cronJobConfig
     * @return
     * @throws Exception
     */
    private List<ExcelContent> generateExcels(Long jobId, CronJobConfig cronJobConfig, User user) throws Exception {
        scheduleLogger.info("CronJob (:{}) fetching excel contents", jobId);

        ScriptEngine engine = getExecuptParamScriptEngine();

        Map<String, WorkBookContext> workBookContextMap = new HashMap<>();

        Map<String, Integer> vizOrderMap = new HashMap<>();
        Map<Long, Map<Long, Integer>> displayPageMap = new HashMap<>();
        Map<String, Integer> excelEntityOrderMap = new HashMap<>();

        List<CronJobContent> jobContentList = getCronJobContents(cronJobConfig, vizOrderMap, displayPageMap);

        if (CollectionUtils.isEmpty(jobContentList)) {
            scheduleLogger.warn("CronJob (:{}):  excel entity is empty", jobId);
            return null;
        }

        for (CronJobContent cronJobContent : jobContentList) {
            int order = 0;
            if (cronJobContent.getContentType().equalsIgnoreCase(DISPLAY)) {
                if (vizOrderMap.containsKey(DISPLAY + AT_SYMBOL + cronJobContent.getId())) {
                    order = vizOrderMap.get(DISPLAY + AT_SYMBOL + cronJobContent.getId());
                }
                Display display = displayMapper.getById(cronJobContent.getId());
                List<WidgetWithVizId> widgetsWithSlideIdList = widgetMapper.queryByDisplayId(cronJobContent.getId());
                if (display != null && !CollectionUtils.isEmpty(widgetsWithSlideIdList)) {
                    ProjectDetail projectDetail = projectService.getProjectDetail(display.getProjectId(), user, false);
                    boolean isMaintainer = projectService.isMaintainer(projectDetail, user);
                    Map<Long, Integer> slidePageMap = displayPageMap.get(cronJobContent.getId());

                    Map<Long, List<WidgetWithVizId>> slideWidgetsMap = widgetsWithSlideIdList.stream().collect(Collectors.groupingBy(WidgetWithVizId::getVizId));
                    int slidePageSize = slideWidgetsMap.size();
                    List<Long> slideIds = new ArrayList<>();
                    if (CollectionUtils.isEmpty(cronJobContent.getItems())) {
                        //all of slides in display
                        slideIds.addAll(slideWidgetsMap.keySet());
                    } else {
                        //checked slides in display
                        slideIds = cronJobContent.getItems();
                    }
                    for (Long slideId : slideIds) {
                        List<WidgetWithVizId> widgets = slideWidgetsMap.get(slideId);
                        if (CollectionUtils.isEmpty(widgets)) {
                            continue;
                        }
                        List<WidgetContext> widgetContexts = new ArrayList<>();
                        widgets.forEach(widget -> {
                            ViewExecuteParam viewExecuteParam = getViewExecuteParam(engine, null, widget.getConfig(), null);
                            widgetContexts.add(new WidgetContext(widget, isMaintainer, viewExecuteParam));
                        });

                        WorkBookContext workBookContext = WorkBookContext.WorkBookContextBuilder.newBuildder()
                                .withWidgets(widgetContexts)
                                .withUser(user)
                                .withResultLimit(resultLimit)
                                .withTaskKey("Schedule_" + jobId)
                                .withCustomLogger(scheduleLogger)
                                .build();

                        int page = slidePageMap.get(slideId);
                        String workBookName = slidePageSize == 1 ? display.getName() : display.getName() + "(" + page + ")";
                        workBookContextMap.put(workBookName, workBookContext);
                        excelEntityOrderMap.put(workBookName, order + page);
                    }
                }
            } else {
                if (vizOrderMap.containsKey(DASHBOARD + AT_SYMBOL + cronJobContent.getId())) {
                    order = vizOrderMap.get(DASHBOARD + AT_SYMBOL + cronJobContent.getId());
                }
                DashboardWithPortal dashboard = dashboardMapper.getDashboardWithPortalAndProject(cronJobContent.getId());
                excelEntityOrderMap.put(dashboard.getName(), vizOrderMap.get(DASHBOARD + AT_SYMBOL + cronJobContent.getId()));

                ProjectDetail projectDetail = projectService.getProjectDetail(dashboard.getProject().getId(), user, false);
                boolean isMaintainer = projectService.isMaintainer(projectDetail, user);

                Set<WidgetWithRelationDashboardId> set = widgetMapper.getByDashboard(cronJobContent.getId());
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
                            .withTaskKey("Schedule_" + jobId)
                            .withCustomLogger(scheduleLogger)
                            .build();

                    workBookContextMap.put(dashboard.getName(), workBookContext);
                    excelEntityOrderMap.put(dashboard.getName(), order);
                }
            }
        }


        if (CollectionUtils.isEmpty(workBookContextMap)) {
            scheduleLogger.warn("CronJob (:{}):  WorkbookContext is empty", jobId);
            return null;
        }

        List<ExcelContent> excelContents = new CopyOnWriteArrayList<>();
        Map<String, Future<String>> excelPathFutureMap = new LinkedHashMap<>();
        workBookContextMap.forEach((name, context) -> {
            scheduleLogger.info("CronJob (:{}): submit Workbook task: {}", jobId, name);
            String uuid = UUID.randomUUID().toString().replace("-", EMPTY);
            context.setWrapper(new MsgWrapper(new MsgMailExcel(jobId), ActionEnum.MAIL, uuid));
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
                excelContents.add(new ExcelContent(excelEntityOrderMap.get(name), name, excelPath));
            }
        });
        excelContents.sort(Comparator.comparing(ExcelContent::getOrder));
        scheduleLogger.info("CronJob (:{}) fetched excel contents, count {}", jobId, excelContents.size());

        return excelContents.isEmpty() ? null : excelContents;
    }

    private List<CronJobContent> getCronJobContents(CronJobConfig cronJobConfig, Map<String, Integer> orderMap,
                                                    Map<Long, Map<Long, Integer>> displayPageMap) {
        List<CronJobContent> jobContentList = new ArrayList<>();
        Map<String, Integer> orderWeightMap = new HashMap<>();
        Set<Long> dashboardIds = new HashSet<>();
        Set<Long> checkedPortalIds = new HashSet<>();
        Set<Long> refPortalIds = new HashSet<>();
        Set<Long> checkedDisplayIds = new HashSet<>();

        for (int i = 0; i < cronJobConfig.getContentList().size(); i++) {
            int orderWeight = i * 1000;
            CronJobContent cronJobContent = cronJobConfig.getContentList().get(i);
            if (cronJobContent.getContentType().equalsIgnoreCase(DISPLAY)) {
                checkedDisplayIds.add(cronJobContent.getId());
                orderWeightMap.put(DISPLAY + AT_SYMBOL + cronJobContent.getId(), orderWeight);
                jobContentList.add(cronJobContent);
                orderMap.put(DISPLAY + AT_SYMBOL + cronJobContent.getId(), orderWeight);
            } else {
                orderWeightMap.put(PORTAL + AT_SYMBOL + cronJobContent.getId(), orderWeight);
                if (CollectionUtils.isEmpty(cronJobContent.getItems())) {
                    checkedPortalIds.add(cronJobContent.getId());
                } else {
                    List<Long> items = cronJobContent.getItems();
                    dashboardIds.addAll(items);
                }
            }
        }

        // dashboard
        Set<Dashboard> dashboards = new HashSet<>();
        if (!CollectionUtils.isEmpty(dashboardIds)) {
            Set<Dashboard> checkDashboards = dashboardMapper.queryDashboardsByIds(dashboardIds);
            if (!CollectionUtils.isEmpty(checkDashboards)) {
                dashboards.addAll(checkDashboards);
            }
        }

        if (!CollectionUtils.isEmpty(checkedPortalIds)) {
            Set<Dashboard> checkoutPortalDashboards = dashboardMapper.queryByPortals(checkedPortalIds);
            if (!CollectionUtils.isEmpty(checkoutPortalDashboards)) {
                dashboards.addAll(checkoutPortalDashboards);
            }
        }

        if (!CollectionUtils.isEmpty(dashboards)) {
            for (Dashboard dashboard : dashboards) {
                if (dashboard != null && dashboard.getType() == 1) {
                    jobContentList.add(new CronJobContent(DASHBOARD, dashboard.getId()));
                    refPortalIds.add(dashboard.getDashboardPortalId());
                }
            }
        }

        if (!CollectionUtils.isEmpty(refPortalIds)) {
            Set<Dashboard> refPortalAllDashboards = dashboardMapper.queryByPortals(refPortalIds);
            Map<Long, List<Dashboard>> portalDashboardsMap = refPortalAllDashboards.stream().collect(Collectors.groupingBy(Dashboard::getDashboardPortalId));
            portalDashboardsMap.forEach((pId, ds) -> {
                DashboardTree tree = new DashboardTree(pId, 0);
                buildDashboardTree(tree, ds);
                List<DashboardTree> list = tree.traversalLeaf();
                if (!CollectionUtils.isEmpty(list)) {
                    for (int i = 0; i < list.size(); i++) {
                        DashboardTree node = list.get(i);
                        if (!orderMap.containsKey(DASHBOARD + AT_SYMBOL + node.getId())) {
                            orderMap.put(DASHBOARD + AT_SYMBOL + node.getId(), i + orderWeightMap.get(PORTAL + AT_SYMBOL + pId));
                        }
                    }
                }
            });
        }

        //display
        List<DisplaySlide> displaySlides = displaySlideMapper.queryByDisplayIds(checkedDisplayIds);
        if (!CollectionUtils.isEmpty(displaySlides)) {
            Map<Long, List<DisplaySlide>> displaySlidesMap = displaySlides.stream().collect(Collectors.groupingBy(DisplaySlide::getDisplayId));
            displaySlidesMap.forEach((displayId, slides) -> {
                Map<Long, Integer> slidePageMap = new HashMap<>();
                slides.sort(Comparator.comparing(DisplaySlide::getIndex));
                for (int i = 0; i < slides.size(); i++) {
                    slidePageMap.put(slides.get(i).getId(), i + 1);
                }
                displayPageMap.put(displayId, slidePageMap);
            });
        }
        return jobContentList;
    }

    private void buildDashboardTree(DashboardTree root, List<Dashboard> dashboards) {
        if (CollectionUtils.isEmpty(dashboards)) {
            return;
        }
        Map<Long, Set<Dashboard>> dashboardsMap = new HashMap<>();
        List<DashboardTree> rootChilds = new ArrayList<>();
        for (Dashboard dashboard : dashboards) {
            if (dashboard.getParentId() > 0L && !dashboard.getParentId().equals(dashboard.getId())) {
                Set<Dashboard> set;
                if (dashboardsMap.containsKey(dashboard.getParentId())) {
                    set = dashboardsMap.get(dashboard.getParentId());
                } else {
                    set = new HashSet<>();
                }
                set.add(dashboard);
                dashboardsMap.put(dashboard.getParentId(), set);
            } else {
                rootChilds.add(new DashboardTree(dashboard.getId(), dashboard.getIndex()));
            }
        }

        rootChilds.sort(Comparator.comparing(DashboardTree::getIndex));
        root.setChilds(rootChilds);

        for (DashboardTree child : rootChilds) {
            child.setChilds(getChilds(dashboardsMap, child));
        }
    }

    private List<DashboardTree> getChilds(Map<Long, Set<Dashboard>> dashboardsMap, DashboardTree node) {
        if (CollectionUtils.isEmpty(dashboardsMap)) {
            return null;
        }
        Set<Dashboard> childs = dashboardsMap.get(node.getId());
        if (CollectionUtils.isEmpty(childs)) {
            return null;
        }
        List<DashboardTree> list = new ArrayList<>();
        for (Dashboard dashboard : childs) {
            DashboardTree treeNode = new DashboardTree(dashboard.getId(), dashboard.getIndex());
            treeNode.setChilds(getChilds(dashboardsMap, treeNode));
            list.add(treeNode);
        }
        list.sort(Comparator.comparing(DashboardTree::getIndex));
        return list;
    }

    private String getContentUrl(Long userId, String contentType, Long contengId, int index) {
        String shareToken = shareService.generateShareToken(contengId, null, userId);
        StringBuilder sb = new StringBuilder();

        String type = "";
        String page = "";
        if ("widget".equalsIgnoreCase(contentType)) {
            type = "widget";
        } else if (PORTAL.equalsIgnoreCase(contentType) || "dashboard".equalsIgnoreCase(contentType)) {
            type = "dashboard";
        } else {
            type = "";
            page = "p=" + index;
        }

        sb.append(serverUtils.getLocalHost())
                .append("/share.html#/share/")
                .append(contentType.equalsIgnoreCase("widget") || contentType.equalsIgnoreCase(PORTAL) ? "dashboard" : contentType)
                .append("?shareInfo=")
                .append(shareToken);

        if (!StringUtils.isEmpty(type)) {
            sb.append("&type=").append(type);
        }

        if (!StringUtils.isEmpty(page)) {
            sb.append("&").append(page);
        }


        return sb.toString();
    }
}
