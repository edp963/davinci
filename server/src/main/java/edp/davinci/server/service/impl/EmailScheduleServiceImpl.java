/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
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

package edp.davinci.server.service.impl;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.*;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.component.excel.ExecutorUtil;
import edp.davinci.server.component.excel.MsgWrapper;
import edp.davinci.server.component.excel.WidgetContext;
import edp.davinci.server.component.excel.WorkBookContext;
import edp.davinci.server.component.quartz.ScheduleService;
import edp.davinci.server.component.screenshot.ImageContent;
import edp.davinci.server.dao.*;
import edp.davinci.server.dto.cronjob.CronJobConfig;
import edp.davinci.server.dto.cronjob.CronJobContent;
import edp.davinci.server.dto.cronjob.ExcelContent;
import edp.davinci.server.dto.cronjob.MsgMailExcel;
import edp.davinci.server.dto.dashboard.DashboardWithPortal;
import edp.davinci.server.dto.project.ProjectDetail;
import edp.davinci.server.dto.widget.WidgetWithRelationDashboardId;
import edp.davinci.server.dto.widget.WidgetWithVizId;
import edp.davinci.server.enums.*;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.model.MailAttachment;
import edp.davinci.server.model.MailContent;
import edp.davinci.server.service.ProjectService;
import edp.davinci.server.util.MailUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import static edp.davinci.commons.Constants.*;

@Service("emailScheduleService")
public class EmailScheduleServiceImpl extends BaseScheduleService implements ScheduleService {

    private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

    @Autowired
    private MailUtils mailUtils;

    @Autowired
    private WidgetExtendMapper widgetExtendMapper;

    @Autowired
    private MemDashboardWidgetExtendMapper memDashboardWidgetExtendMapper;

    @Autowired
    private UserExtendMapper userExtendMapper;

    @Autowired
    private DashboardExtendMapper dashboardExtendMapper;

    @Autowired
    private DisplayExtendMapper displayExtendMapper;

    @Autowired
    private ProjectService projectService;

    @Value("${source.result-limit:1000000}")
    private int resultLimit;

    @Override
    public void execute(long jobId) throws Exception {
        CronJob cronJob = preExecute(jobId);
        if (cronJob == null) {
            return;
        }

        CronJobConfig cronJobConfig = JSONUtils.toObject(cronJob.getConfig(), CronJobConfig.class);

        List<ExcelContent> excels = null;
        List<ImageContent> images = null;

        User creator = userExtendMapper.selectByPrimaryKey(cronJob.getCreateBy());

        if (cronJobConfig.getType().equals(CronJobMediaType.IMAGE.getType())) {
            images = generateImages(jobId, cronJobConfig, creator.getId());
        }

        if (cronJobConfig.getType().equals(CronJobMediaType.EXCEL.getType())) {
			excels = generateExcels(jobId, cronJobConfig, creator);
        }

        if (cronJobConfig.getType().equals(CronJobMediaType.IMAGEANDEXCEL.getType())) {
            images = generateImages(jobId, cronJobConfig, creator.getId());
            excels = generateExcels(jobId, cronJobConfig, creator);
        }

        List<MailAttachment> attachmentList = new ArrayList<>();

        if (!CollectionUtils.isEmpty(excels)) {
            excels.forEach(excel -> attachmentList.add(new MailAttachment(excel.getName() + FileTypeEnum.XLSX.getFormat(), excel.getFile())));
        }
        if (!CollectionUtils.isEmpty(images)) {
            images.forEach(image -> {
                String contentId = CronJobMediaType.IMAGE.getType() + UNDERLINE
                        + UUID.randomUUID().toString().replaceAll(MINUS, EMPTY);
                attachmentList.add(new MailAttachment(contentId, image.getImageFile(), image.getUrl(), true));
            });
        }

        if (CollectionUtils.isEmpty(attachmentList)) {
        	scheduleLogger.warn("CronJob({}) email content is empty", jobId);
            return;
        }

        scheduleLogger.info("CronJob({}) is ready to send email", cronJob.getId());

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
        	scheduleLogger.error("CronJob({}) build email content error:{}", jobId, e.getMessage());
        }
        mailUtils.sendMail(mailContent, null);
        scheduleLogger.info("CronJob({}) is finish! --------------", jobId);
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

    	scheduleLogger.info("CronJob({}) fetching excel contents", jobId);

        Map<String, WorkBookContext> workBookContextMap = new HashMap<>();

        Map<String, Integer> vizOrderMap = new HashMap<>();
        Map<Long, Map<Long, Integer>> displayPageMap = new HashMap<>();
        Map<String, Integer> excelEntityOrderMap = new HashMap<>();

        List<CronJobContent> jobContentList = getCronJobContents(cronJobConfig, vizOrderMap, displayPageMap);

        if (CollectionUtils.isEmpty(jobContentList)) {
        	scheduleLogger.warn("CronJob({}) excel entity is empty", jobId);
            return null;
        }

        for (CronJobContent cronJobContent : jobContentList) {
            int order = 0;
            if (cronJobContent.getContentType().equalsIgnoreCase(DISPLAY)) {
                if (vizOrderMap.containsKey(DISPLAY + AT_SIGN + cronJobContent.getId())) {
                    order = vizOrderMap.get(DISPLAY + AT_SIGN + cronJobContent.getId());
                }
                Display display = displayExtendMapper.selectByPrimaryKey(cronJobContent.getId());
                List<WidgetWithVizId> widgetsWithSlideIdList = widgetExtendMapper.queryByDisplayId(cronJobContent.getId());
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
                            widgetContexts.add(new WidgetContext(widget, isMaintainer, null));
                        });

                        WorkBookContext workBookContext = WorkBookContext.builder()
                                .widgets(widgetContexts)
                                .user(user)
                                .resultLimit(resultLimit)
                                .taskKey("Schedule_" + jobId)
                                .customLogger(scheduleLogger)
                                .build();

                        int page = slidePageMap.get(slideId);
                        String workBookName = slidePageSize == 1 ? display.getName() : display.getName() + "(" + page + ")";
                        workBookContextMap.put(workBookName, workBookContext);
                        excelEntityOrderMap.put(workBookName, order + page);
                    }
                }
            } else {
                if (vizOrderMap.containsKey(DASHBOARD + AT_SIGN + cronJobContent.getId())) {
                    order = vizOrderMap.get(DASHBOARD + AT_SIGN + cronJobContent.getId());
                }
                DashboardWithPortal dashboard = dashboardExtendMapper.getDashboardWithPortalAndProject(cronJobContent.getId());
                excelEntityOrderMap.put(dashboard.getName(), vizOrderMap.get(DASHBOARD + AT_SIGN + cronJobContent.getId()));

                ProjectDetail projectDetail = projectService.getProjectDetail(dashboard.getProject().getId(), user, false);
                boolean isMaintainer = projectService.isMaintainer(projectDetail, user);

                List<WidgetWithRelationDashboardId> widgets = widgetExtendMapper.getByDashboard(cronJobContent.getId());
                if (!CollectionUtils.isEmpty(widgets)) {

                    List<MemDashboardWidget> mdws = memDashboardWidgetExtendMapper.getByDashboardId(dashboard.getId());
                    Map<Long, MemDashboardWidget> mdwMap = mdws.stream().collect(Collectors.toMap(o -> o.getWidgetId(), o -> o, (oldV, newV) -> oldV));

                    List<WidgetContext> widgetContexts = new ArrayList<>();
                    widgets.forEach(w -> {
                        Widget widget = new Widget();
                        BeanUtils.copyProperties(w, widget);
                        WidgetContext context = new WidgetContext(widget, dashboard, mdwMap.get(widget.getId()), null);
                        context.setIsMaintainer(isMaintainer);
                        widgetContexts.add(context);
                    });

                    WorkBookContext workBookContext = WorkBookContext.builder()
                            .widgets(widgetContexts)
                            .user(user)
                            .resultLimit(resultLimit)
                            .taskKey("Schedule_" + jobId)
                            .customLogger(scheduleLogger)
                            .build();

                    workBookContextMap.put(dashboard.getName(), workBookContext);
                    excelEntityOrderMap.put(dashboard.getName(), order);
                }
            }
        }

        if (CollectionUtils.isEmpty(workBookContextMap)) {
        	scheduleLogger.warn("CronJob({}) workbook context is empty", jobId);
            return null;
        }

        List<ExcelContent> excelContents = new CopyOnWriteArrayList<>();
        Map<String, Future<String>> excelPathFutureMap = new LinkedHashMap<>();
		int contextSize = workBookContextMap.size();
		final AtomicInteger index = new AtomicInteger(1);
		workBookContextMap.forEach((name, context) -> {
			scheduleLogger.info("CronJob({}) submit workbook task:{}, thread:{}, total:{}", jobId, name, index,
					contextSize);
			try {
				String uuid = UUID.randomUUID().toString().replace("-", EMPTY);
				context.setWrapper(new MsgWrapper(new MsgMailExcel(jobId), ActionEnum.MAIL, uuid));
				excelPathFutureMap.put(name, ExecutorUtil.submitWorkbookTask(context, scheduleLogger));
			} catch (Exception e) {
				scheduleLogger.error("Cronjob({}) submit workbook task error, thread:{}", jobId, index.get());
				scheduleLogger.error(e.toString(), e);
			} finally {
				index.incrementAndGet();
			}
		});

        excelPathFutureMap.forEach((name, future) -> {
            String excelPath = null;
            try {
                excelPath = future.get(1, TimeUnit.HOURS);
                scheduleLogger.info("CronJob({}) workbook task:{} finish", jobId, name);
            } catch (Exception e) {
            	scheduleLogger.info("CronJob({}) workbook task:{} error", jobId, name);
            	scheduleLogger.error(e.toString(), e);
            }
            if (!StringUtils.isEmpty(excelPath)) {
                excelContents.add(new ExcelContent(excelEntityOrderMap.get(name), name, excelPath));
            }
        });

        excelContents.sort(Comparator.comparing(ExcelContent::getOrder));
        scheduleLogger.info("CronJob({}) fetched excel contents, count:{}", jobId, excelContents.size());
        return excelContents.isEmpty() ? null : excelContents;
    }

}