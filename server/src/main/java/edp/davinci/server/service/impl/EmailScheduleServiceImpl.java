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

import static edp.davinci.commons.Constants.AT_SIGN;
import static edp.davinci.commons.Constants.EMPTY;
import static edp.davinci.commons.Constants.MINUS;
import static edp.davinci.commons.Constants.UNDERLINE;
import static edp.davinci.server.util.ScriptUtils.getWidgetQueryParam;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;


import edp.davinci.server.dto.cronjob.*;
import edp.davinci.server.enums.*;
import edp.davinci.server.util.CronJobTrackUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.CronJob;
import edp.davinci.core.dao.entity.Display;
import edp.davinci.core.dao.entity.User;
import edp.davinci.core.dao.entity.Widget;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.component.excel.ExecutorUtil;
import edp.davinci.server.component.excel.MsgWrapper;
import edp.davinci.server.component.excel.WidgetContext;
import edp.davinci.server.component.excel.WorkBookContext;
import edp.davinci.server.component.quartz.ScheduleService;
import edp.davinci.server.component.screenshot.ImageContent;
import edp.davinci.server.dao.CronJobExtendMapper;
import edp.davinci.server.dao.DashboardExtendMapper;
import edp.davinci.server.dao.DisplayExtendMapper;
import edp.davinci.server.dao.UserExtendMapper;
import edp.davinci.server.dao.WidgetExtendMapper;
import edp.davinci.server.dto.dashboard.DashboardWithPortal;
import edp.davinci.server.dto.project.ProjectDetail;
import edp.davinci.server.dto.view.WidgetQueryParam;
import edp.davinci.server.dto.widget.WidgetWithRelationDashboardId;
import edp.davinci.server.dto.widget.WidgetWithVizId;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.model.MailAttachment;
import edp.davinci.server.model.MailContent;
import edp.davinci.server.service.ProjectService;
import edp.davinci.server.util.MailUtils;

@Service("emailScheduleService")
public class EmailScheduleServiceImpl extends BaseScheduleService implements ScheduleService {

    private static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

    @Autowired
    private CronJobExtendMapper cronJobExtendMapper;

    @Autowired
    private MailUtils mailUtils;

    @Autowired
    private WidgetExtendMapper widgetMapper;

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
        CronJob cronJob = cronJobExtendMapper.selectByPrimaryKey(jobId);
	    CronJobTrack cronJobTrack = new CronJobTrack(cronJob);
	    if (null == cronJob || StringUtils.isEmpty(cronJob.getConfig())) {
        	scheduleLogger.error("CronJob({}) config is empty", jobId);
		    CronJobTrackUtils.error(cronJobTrack, CronJobStepEnum.MAIL_1_PARSE_CONFIG, "config is empty");
		    return;
        }
        cronJobExtendMapper.updateExecLog(jobId, "");
        CronJobConfig cronJobConfig = null;
        try {
            cronJobConfig = JSONUtils.toObject(cronJob.getConfig(), CronJobConfig.class);
        } catch (Exception e) {
        	scheduleLogger.error("Cronjob({}) parse config({}) error:{}", jobId, cronJob.getConfig(), e.getMessage());
	        CronJobTrackUtils.getBuilder().appendParam("config", cronJob.getConfig()).appendParam("error", e.toString())
			        .error(cronJobTrack, CronJobStepEnum.MAIL_1_PARSE_CONFIG, "parse config error");
            return;
        }

        if (StringUtils.isEmpty(cronJobConfig.getType())) {
            scheduleLogger.error("Cronjob({}) config type is empty", jobId);
	        CronJobTrackUtils.error(cronJobTrack, CronJobStepEnum.MAIL_1_PARSE_CONFIG, "config type is empty");
	        return;
        }
        
        scheduleLogger.info("CronJob({}) is start! --------------", jobId);
	    CronJobTrackUtils.info(cronJobTrack, CronJobStepEnum.MAIL_1_PARSE_CONFIG, "parse config is finish ");

	    List<ExcelContent> excels = null;
        List<ImageContent> images = null;

        User creater = userExtendMapper.selectByPrimaryKey(cronJob.getCreateBy());

        if (cronJobConfig.getType().equals(CronJobMediaType.IMAGE.getType())) {
            images = generateImages(jobId, cronJobConfig, creater.getId(), cronJobTrack);
        }
        
        if (cronJobConfig.getType().equals(CronJobMediaType.EXCEL.getType())) {
			excels = generateExcels(jobId, cronJobConfig, creater, cronJobTrack);
        }

        if (cronJobConfig.getType().equals(CronJobMediaType.IMAGEANDEXCEL.getType())) {
            images = generateImages(jobId, cronJobConfig, creater.getId(), cronJobTrack);
            excels = generateExcels(jobId, cronJobConfig, creater, cronJobTrack);
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
	        CronJobTrackUtils.error(cronJobTrack, CronJobStepEnum.MAIL_5_SEND, "mail send content is empty");
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
	        CronJobTrackUtils.error(cronJobTrack, CronJobStepEnum.MAIL_5_SEND, "CronJob build email error");
        }
	    try {
		    mailUtils.sendMail(mailContent, null);
	    } catch (Exception e) {
		    CronJobTrackUtils.getBuilder().appendParam("errro", e.toString())
				    .error(cronJobTrack, CronJobStepEnum.MAIL_5_SEND, "CronJob send email fail");
		    throw e;
	    }
	    scheduleLogger.info("CronJob({}) is finish! --------------", jobId);
	    CronJobTrackUtils.info(cronJobTrack, CronJobStepEnum.MAIL_5_SEND, "CronJob is finish!");
    }


    /**
     * 根据job配置生成excel
     *
     * @param jobId
     * @param cronJobConfig
     * @return
     * @throws Exception
     */
    private List<ExcelContent> generateExcels(Long jobId, CronJobConfig cronJobConfig, User user, CronJobTrack cronJobTrack) throws Exception {

    	scheduleLogger.info("CronJob({}) fetching excel contents", jobId);

	    Map<String, WorkBookContext> workBookContextMap = new HashMap<>();

        Map<String, Integer> vizOrderMap = new HashMap<>();
        Map<Long, Map<Long, Integer>> displayPageMap = new HashMap<>();
        Map<String, Integer> excelEntityOrderMap = new HashMap<>();

        List<CronJobContent> jobContentList = getCronJobContents(cronJobConfig, vizOrderMap, displayPageMap);

        if (CollectionUtils.isEmpty(jobContentList)) {
        	scheduleLogger.warn("CronJob({}) excel entity is empty", jobId);
	        CronJobTrackUtils.error(cronJobTrack, CronJobStepEnum.MAIL_4_GENERATE_EXCEL, "CronJob share excel is empty");
	        return null;
        }

        for (CronJobContent cronJobContent : jobContentList) {
            int order = 0;
            if (cronJobContent.getContentType().equalsIgnoreCase(DISPLAY)) {
                if (vizOrderMap.containsKey(DISPLAY + AT_SIGN + cronJobContent.getId())) {
                    order = vizOrderMap.get(DISPLAY + AT_SIGN + cronJobContent.getId());
                }
                Display display = displayExtendMapper.selectByPrimaryKey(cronJobContent.getId());
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
                            WidgetQueryParam viewExecuteParam = getWidgetQueryParam(null, widget.getConfig(), null);
                            widgetContexts.add(new WidgetContext(widget, isMaintainer, viewExecuteParam));
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

                List<WidgetWithRelationDashboardId> widgets = widgetMapper.getByDashboard(cronJobContent.getId());
                if (!CollectionUtils.isEmpty(widgets)) {
                    List<WidgetContext> widgetContexts = new ArrayList<>();
                    widgets.forEach(w -> {
                        Widget widget = new Widget();
                        BeanUtils.copyProperties(w, widget);
                        WidgetQueryParam viewExecuteParam = getWidgetQueryParam(dashboard.getConfig(), widget.getConfig(), w.getRelationId());
                        widgetContexts.add(new WidgetContext(widget, isMaintainer, viewExecuteParam));
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
	        CronJobTrackUtils.error(cronJobTrack, CronJobStepEnum.MAIL_4_GENERATE_EXCEL, "CronJob share excel workbook context is empty");
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
				scheduleLogger.error(e.getMessage(), e);
				CronJobTrackUtils.getBuilder().appendParam("error", e.toString())
						.error(cronJobTrack, CronJobStepEnum.MAIL_4_GENERATE_EXCEL, "Cronjob submit workbook task error");
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
            	scheduleLogger.error(e.getMessage(), e);
	            CronJobTrackUtils.getBuilder().appendParam("error", e.toString())
			            .error(cronJobTrack, CronJobStepEnum.MAIL_4_GENERATE_EXCEL, "CronJob workbook task execute error");
            }
            if (!StringUtils.isEmpty(excelPath)) {
                excelContents.add(new ExcelContent(excelEntityOrderMap.get(name), name, excelPath));
            }
        });

        excelContents.sort(Comparator.comparing(ExcelContent::getOrder));
        scheduleLogger.info("CronJob({}) fetched excel contents, count:{}", jobId, excelContents.size());
	    CronJobTrackUtils.getBuilder().appendParam("count", excelContents.size())
			    .info(cronJobTrack, CronJobStepEnum.MAIL_4_GENERATE_EXCEL, "CronJob generate share excel contents is finish");
        return excelContents.isEmpty() ? null : excelContents;
    }

}